const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();
const ADMIN_ID = process.env.RBAC_BOOTSTRAP_ADMIN_ID || "user_3H26c55ljZpSP1Ybm5ovXhyD2b8";

async function main() {
  const [courses, purchases, progresses, stripeCustomers, instructorAssignments, reviews] = await Promise.all([
    db.course.findMany({ select: { id: true, userId: true, price: true, completionRules: true } }),
    db.purchase.findMany({ select: { id: true, userId: true, courseId: true, status: true } }),
    db.userProgress.findMany({ select: { userId: true } }),
    db.stripeCustomer.findMany({ select: { userId: true } }),
    db.courseInstructor.findMany({ select: { userId: true } }),
    db.courseReview.findMany({ select: { id: true, status: true } }),
  ]);

  const teacherIds = new Set(courses.map((course) => course.userId));
  instructorAssignments.forEach((row) => teacherIds.add(row.userId));
  teacherIds.add(ADMIN_ID);
  const studentIds = new Set([...purchases.map((item) => item.userId), ...progresses.map((item) => item.userId), ...stripeCustomers.map((item) => item.userId)]);

  for (const userId of studentIds) {
    if (!teacherIds.has(userId)) await db.user.upsert({ where: { id: userId }, update: {}, create: { id: userId, role: "STUDENT" } });
  }
  for (const userId of teacherIds) {
    await db.user.upsert({ where: { id: userId }, update: { role: userId === ADMIN_ID ? "ADMIN" : "TEACHER" }, create: { id: userId, role: userId === ADMIN_ID ? "ADMIN" : "TEACHER" } });
  }
  for (const course of courses) {
    await db.courseInstructor.upsert({ where: { courseId_userId: { courseId: course.id, userId: course.userId } }, update: { role: "OWNER" }, create: { courseId: course.id, userId: course.userId, role: "OWNER" } });
    await db.courseCompletionRule.upsert({ where: { courseId: course.id }, update: {}, create: { courseId: course.id, requireAllLessons: true, minimumProgress: 100, requireAllQuizzes: false } });
    // Existing boolean publishing state is authoritative during migration.
    const current = await db.course.findUnique({ where: { id: course.id }, select: { isPublished: true, status: true } });
    if (current) {
      const status = current.isPublished ? "PUBLISHED" : (current.status || "DRAFT");
      await db.course.update({ where: { id: course.id }, data: { status, publishedAt: current.isPublished ? undefined : null } });
    }
  }
  for (const purchase of purchases) {
    const course = courses.find((item) => item.id === purchase.courseId);
    const status = purchase.status || "SUCCEEDED";
    await db.purchase.update({ where: { id: purchase.id }, data: { status, amount: Number(course?.price || 0) } }).catch(() => {});
    if (status === "SUCCEEDED") {
      await db.enrollment.upsert({ where: { userId_courseId: { userId: purchase.userId, courseId: purchase.courseId } }, update: {}, create: { userId: purchase.userId, courseId: purchase.courseId, status: "ACTIVE" } });
    }
  }


  // Existing legacy reviews are treated as already moderated; new reviews default to PENDING.
  for (const review of reviews) {
    if (review.status !== "APPROVED") {
      await db.courseReview.update({ where: { id: review.id }, data: { status: "APPROVED" } });
    }
  }

  console.log(`LMS migration complete. Admin: ${ADMIN_ID}; users mapped: ${teacherIds.size + [...studentIds].filter((id) => !teacherIds.has(id)).length}; courses: ${courses.length}; purchases checked: ${purchases.length}; legacy reviews normalized: ${reviews.length}.`);
}

main().catch((error) => { console.error("LMS migration failed", error); process.exitCode = 1; }).finally(() => db.$disconnect());
