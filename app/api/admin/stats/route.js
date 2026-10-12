import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();
    const [users, teachers, admins, courses, publishedCourses, pendingCourses, enrollments, purchases, reviews, certificates, auditLogs] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "TEACHER" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.course.count({ where: { status: "PENDING_REVIEW" } }),
      db.enrollment.count({ where: { status: { not: "CANCELLED" } } }),
      db.purchase.findMany({ where: { status: "SUCCEEDED" }, select: { amount: true } }),
      db.courseReview.count({ where: { status: "APPROVED" } }),
      db.certificate.count({ where: { revokedAt: null } }),
      db.auditLog.count(),
    ]);
    const revenue = purchases.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return NextResponse.json({ users, teachers, admins, courses, publishedCourses, pendingCourses, enrollments, reviews, certificates, auditLogs, revenue });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
