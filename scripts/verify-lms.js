const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const [users, students, teachers, admins, courses, publishedCourses, pendingCourses, assignments, enrollments, completedEnrollments, purchases, refundedPurchases, reviews, quizzes, requiredQuizzes, attempts, announcements, resources, notes, bookmarks, certificates, threads, notifications, paymentEvents, auditLogs, orphanedAssignments, duplicatePurchasePairs, duplicateCertificates] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.course.count(),
    db.course.count({ where: { isPublished: true, status: "PUBLISHED" } }),
    db.course.count({ where: { status: "PENDING_REVIEW" } }),
    db.courseInstructor.count(),
    db.enrollment.count({ where: { status: { not: "CANCELLED" } } }),
    db.enrollment.count({ where: { status: "COMPLETED" } }),
    db.purchase.count({ where: { status: "SUCCEEDED" } }),
    db.purchase.count({ where: { status: "REFUNDED" } }),
    db.courseReview.count(),
    db.quiz.count(),
    db.quiz.count({ where: { requiredForCompletion: true } }),
    db.quizAttempt.count(),
    db.courseAnnouncement.count(),
    db.chapterResource.count(),
    db.note.count(),
    db.bookmark.count(),
    db.certificate.count(),
    db.discussionThread.count(),
    db.notification.count(),
    db.paymentEvent.count(),
    db.auditLog.count(),
    db.courseInstructor.count({ where: { course: { userId: "__missing_owner__" } } }),
    db.purchase.groupBy({ by: ["userId", "courseId"], _count: { _all: true }, having: { id: { _count: { gt: 1 } } } }),
    db.certificate.groupBy({ by: ["userId", "courseId"], _count: { _all: true }, having: { id: { _count: { gt: 1 } } } }),
  ]);
  console.table({ users, students, teachers, admins, courses, publishedCourses, pendingCourses, instructorAssignments: assignments, enrollments, completedEnrollments, successfulPurchases: purchases, refundedPurchases, reviews, quizzes, requiredQuizzes, quizAttempts: attempts, announcements, resources, notes, bookmarks, certificates, threads, notifications, paymentEvents, auditLogs, orphanedAssignments, duplicatePurchasePairs: duplicatePurchasePairs.length, duplicateCertificates: duplicateCertificates.length });
  const adminsOk = admins >= 1;
  const duplicatesOk = duplicatePurchasePairs.length === 0 && duplicateCertificates.length === 0;
  if (!adminsOk || !duplicatesOk) process.exitCode = 2;
}

main().catch((error) => { console.error("LMS verification failed", error); process.exitCode = 1; }).finally(() => db.$disconnect());
