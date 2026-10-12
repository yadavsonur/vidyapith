import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit";
import { randomUUID } from "node:crypto";

const certificateNumber = () => `VID-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const evaluateCourseCompletion = async (userId, courseId, tx = db) => {
  const course = await tx.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: { where: { isPublished: true }, select: { id: true, isRequired: true } },
      quizzes: {
        where: { isPublished: true, requiredForCompletion: true },
        select: { id: true, passingScore: true },
      },
      completionRules: true,
    },
  });
  if (!course) return { completed: false, progress: 0, reason: "course_not_found" };

  const requiredChapters = course.chapters.filter((chapter) => chapter.isRequired);
  const chapterIds = course.chapters.map((chapter) => chapter.id);
  const progressRows = chapterIds.length
    ? await tx.userProgress.findMany({ where: { userId, chapterId: { in: chapterIds } }, select: { chapterId: true, isCompleted: true } })
    : [];
  const progressMap = new Map(progressRows.map((row) => [row.chapterId, row.isCompleted]));
  const total = course.chapters.length;
  const completedCount = course.chapters.filter((chapter) => progressMap.get(chapter.id)).length;
  const progress = total ? Math.min(100, (completedCount / total) * 100) : 0;

  if (total === 0) return { completed: false, progress: 0, lessonsSatisfied: false, quizzesSatisfied: false, total: 0, completedCount: 0, reason: "no_lessons" };

  const rule = course.completionRules || { requireAllLessons: true, minimumProgress: course.completionMinProgress || 100, requireAllQuizzes: false };
  const lessonsSatisfied = rule.requireAllLessons
    ? requiredChapters.every((chapter) => progressMap.get(chapter.id))
    : progress >= Number(rule.minimumProgress);

  let quizzesSatisfied = true;
  if (rule.requireAllQuizzes || course.quizzes.length) {
    for (const quiz of course.quizzes) {
      const passed = await tx.quizAttempt.findFirst({ where: { quizId: quiz.id, userId, passed: true } });
      if (!passed) { quizzesSatisfied = false; break; }
    }
  }
  const completed = lessonsSatisfied && quizzesSatisfied;
  return { completed, progress, lessonsSatisfied, quizzesSatisfied, total, completedCount };
};

export const finalizeCourseCompletion = async (userId, courseId) => {
  return db.$transaction(async (tx) => {
    const result = await evaluateCourseCompletion(userId, courseId, tx);
    if (!result.completed) return { ...result, certificate: null };
    const existingEnrollment = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, completedAt: true },
    });
    const completedAt = existingEnrollment?.completedAt || new Date();
    const enrollment = await tx.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { status: "COMPLETED", completedAt },
      create: { userId, courseId, status: "COMPLETED", completedAt },
    });
    const certificate = await tx.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId, certificateNumber: certificateNumber(), metadata: { progress: result.progress } },
    });
    await writeAuditLog({ actorId: userId, action: "COURSE_COMPLETED", entityType: "Course", entityId: courseId, metadata: { certificateId: certificate.id }, tx });
    await createNotification({
      userId,
      type: "COURSE_COMPLETED",
      title: "Course completed",
      body: "You completed the course and your certificate is ready.",
      link: `/certificates/${certificate.id}`,
      dedupeKey: `course-completed:${userId}:${courseId}`,
      tx,
    });
    await createNotification({
      userId,
      type: "CERTIFICATE_ISSUED",
      title: "Certificate issued",
      body: `Your certificate ${certificate.certificateNumber} is ready to verify.`,
      link: `/certificates/${certificate.id}`,
      dedupeKey: `certificate-issued:${certificate.id}`,
      tx,
    });
    return { ...result, certificate, enrollment };
  });
};
