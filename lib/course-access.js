import { db } from "@/lib/db";

export const getEnrollment = async (userId, courseId) =>
  db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });

export const hasCourseAccess = async (userId, courseId) => {
  if (!userId) return { enrollment: null, purchase: null, hasAccess: false };
  const [enrollment, purchase] = await Promise.all([
    getEnrollment(userId, courseId),
    db.purchase.findUnique({ where: { userId_courseId: { userId, courseId } } }),
  ]);
  const hasAccess =
    (enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED") ||
    purchase?.status === "SUCCEEDED";
  return { enrollment, purchase, hasAccess };
};

export const ensureEnrollment = async (userId, courseId) =>
  db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { status: "ACTIVE", completedAt: null },
    create: { userId, courseId, status: "ACTIVE" },
  });
