import { db } from "@/lib/db";

export const getDashboardCourses = async (userId) => {
  try {
    const [enrollments, purchases] = await Promise.all([
      db.enrollment.findMany({
        where: { userId, status: { not: "CANCELLED" } },
        include: {
          course: {
            include: {
              category: true,
              chapters: { where: { isPublished: true }, orderBy: { position: "asc" } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      db.purchase.findMany({
        where: { userId, status: "SUCCEEDED" },
        include: { course: { include: { category: true, chapters: { where: { isPublished: true } } } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const map = new Map();
    enrollments.forEach((item) => map.set(item.course.id, item.course));
    purchases.forEach((item) => map.set(item.course.id, item.course));

    const courseList = [...map.values()];
    const chapterIds = courseList.flatMap((course) => course.chapters.map((chapter) => chapter.id));
    const progressRows = chapterIds.length
      ? await db.userProgress.findMany({
          where: { userId, chapterId: { in: chapterIds } },
          select: { chapterId: true, isCompleted: true },
        })
      : [];
    const progressByChapter = new Map(progressRows.map((row) => [row.chapterId, row.isCompleted]));
    const courses = courseList.map((course) => {
      const total = course.chapters.length;
      const completed = course.chapters.reduce((count, chapter) => count + (progressByChapter.get(chapter.id) ? 1 : 0), 0);
      return { ...course, progress: total ? Math.min(100, (completed / total) * 100) : 0 };
    });

    const completedCourses = courses.filter((course) => course.progress >= 100);
    const coursesInProgress = courses.filter((course) => course.progress < 100);

    return { completedCourses, coursesInProgress, courses };
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return { completedCourses: [], coursesInProgress: [], courses: [] };
  }
};
