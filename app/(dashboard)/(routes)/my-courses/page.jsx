import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CoursesList } from "@/components/courses-list";
import { BookOpen } from "lucide-react";

const MyCoursesPage = async () => {
  const user = await requireAuth();
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id, status: { not: "CANCELLED" } },
    include: {
      course: {
        include: {
          category: true,
          chapters: { where: { isPublished: true }, select: { id: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const courseIds = enrollments.map(({ course }) => course.id);
  const completedProgress = courseIds.length
    ? await db.userProgress.findMany({
        where: {
          userId: user.id,
          isCompleted: true,
          chapter: { courseId: { in: courseIds }, isPublished: true },
        },
        select: { chapter: { select: { courseId: true } } },
      })
    : [];

  const completedByCourse = new Map();
  const publishedCountByCourse = new Map(
    enrollments.map(({ course }) => [course.id, course.chapters.length])
  );
  for (const row of completedProgress) {
    const courseId = row.chapter.courseId;
    completedByCourse.set(courseId, (completedByCourse.get(courseId) || 0) + 1);
  }

  const items = enrollments.map(({ course }) => ({
    ...course,
    progress: publishedCountByCourse.get(course.id)
      ? Math.round(((completedByCourse.get(course.id) || 0) / publishedCountByCourse.get(course.id)) * 100)
      : 0,
  }));

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-ink-200/80 pb-6">
        <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Active Enrollment Register</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
          Enrolled Syllabi
        </h1>
        <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
          Permanent ledger of courses you have matriculated into with realtime completion tracking.
        </p>
      </div>

      <CoursesList items={items} />
    </div>
  );
};

export default MyCoursesPage;
