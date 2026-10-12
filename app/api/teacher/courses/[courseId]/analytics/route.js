import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_ANALYTICS);
    const [course, enrollments, purchases, reviewAgg, chapterIds, completedEnrollments] = await Promise.all([
      db.course.findUnique({ where: { id: params.courseId }, select: { id: true, title: true, price: true, status: true } }),
      db.enrollment.count({ where: { courseId: params.courseId, status: { not: "CANCELLED" } } }),
      db.purchase.findMany({ where: { courseId: params.courseId }, select: { amount: true, status: true, createdAt: true } }),
      db.courseReview.aggregate({ where: { courseId: params.courseId, status: "APPROVED" }, _avg: { rating: true }, _count: { _all: true } }),
      db.chapter.findMany({ where: { courseId: params.courseId, isPublished: true }, select: { id: true } }),
      db.enrollment.count({ where: { courseId: params.courseId, status: "COMPLETED" } }),
    ]);
    if (!course) return new NextResponse("Course not found", { status: 404 });
    const succeededRevenue = purchases.filter(p => p.status === "SUCCEEDED").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const refunded = purchases.filter(p => p.status === "REFUNDED").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    let averageProgress = 0;
    if (chapterIds.length && enrollments) {
      const rows = await db.userProgress.findMany({ where: { chapterId: { in: chapterIds } }, select: { userId: true, isCompleted: true } });
      const byUser = new Map();
      rows.forEach(r => { const x = byUser.get(r.userId) || 0; byUser.set(r.userId, x + (r.isCompleted ? 1 : 0)); });
      const values = [...byUser.values()].map(c => (c / chapterIds.length) * 100);
      averageProgress = values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;
    }
    return NextResponse.json({ course, enrollments, completedEnrollments, revenue: succeededRevenue, refundedRevenue: refunded, grossPayments: purchases.length, averageRating: reviewAgg._avg.rating || 0, reviewCount: reviewAgg._count._all, averageProgress, lessons: chapterIds.length });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
