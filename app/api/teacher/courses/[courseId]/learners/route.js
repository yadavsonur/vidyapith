import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_ANALYTICS);
    const enrollments = await db.enrollment.findMany({ where: { courseId: params.courseId, status: { not: "CANCELLED" } }, include: { user: { select: { id: true, role: true, studentProfile: { select: { displayName: true, avatarUrl: true } }, _count: { select: { notes: true, bookmarks: true } } } } }, orderBy: { updatedAt: "desc" } });
    const chapterIds = (await db.chapter.findMany({ where: { courseId: params.courseId, isPublished: true }, select: { id: true } })).map(x => x.id);
    const progress = chapterIds.length ? await db.userProgress.findMany({ where: { chapterId: { in: chapterIds }, userId: { in: enrollments.map(e => e.userId) } }, select: { userId: true, isCompleted: true, videoPositionSeconds: true } }) : [];
    const totals = new Map();
    for (const row of progress) { const x = totals.get(row.userId) || { completed: 0, watchedSeconds: 0 }; x.completed += row.isCompleted ? 1 : 0; x.watchedSeconds += Number(row.videoPositionSeconds || 0); totals.set(row.userId, x); }
    return NextResponse.json(enrollments.map(e => ({ ...e, progress: { completed: totals.get(e.userId)?.completed || 0, totalLessons: chapterIds.length, percentage: chapterIds.length ? ((totals.get(e.userId)?.completed || 0) / chapterIds.length) * 100 : 0, watchedSeconds: totals.get(e.userId)?.watchedSeconds || 0 } })));
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
