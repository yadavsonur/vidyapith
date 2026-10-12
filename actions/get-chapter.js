import { db } from "@/lib/db";
import { hasCourseAccess } from "@/lib/course-access";

export const getChapter = async ({ userId, courseId, chapterId }) => {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: { id: true, title: true, description: true, price: true, category: true, userId: true },
    });
    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId, isPublished: true },
    });

    if (!chapter || !course) throw new Error("Chapter or course not found");

    const { purchase, enrollment, hasAccess } = await hasCourseAccess(userId, courseId);
    const isLocked = !chapter.isFree && !hasAccess;

    const [muxData, attachments, resources, nextChapter, userProgress] = await Promise.all([
      !isLocked ? db.muxData.findUnique({ where: { chapterId } }) : null,
      hasAccess ? db.attachement.findMany({ where: { courseId } }) : [],
      !isLocked ? db.chapterResource.findMany({ where: { chapterId, isPublished: true }, orderBy: { createdAt: "desc" } }) : [],
      !isLocked
        ? db.chapter.findFirst({
            where: { courseId, isPublished: true, position: { gt: chapter.position } },
            orderBy: { position: "asc" },
          })
        : null,
      userId ? db.userProgress.findUnique({ where: { userId_chapterId: { userId, chapterId } } }) : null,
    ]);

    return { chapter, course, muxData, attachments, resources, nextChapter, userProgress, purchase, enrollment, hasAccess, isLocked };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return { chapter: null, course: null, muxData: null, attachments: [], resources: [], nextChapter: null, userProgress: null, purchase: null, enrollment: null, hasAccess: false, isLocked: true };
  }
};
