import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try { await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE); const rule = await db.courseCompletionRule.findUnique({ where: { courseId: params.courseId } }); return NextResponse.json(rule || { courseId: params.courseId, requireAllLessons: true, minimumProgress: 100, requireAllQuizzes: false }); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function PUT(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.EDIT_COURSE);
    const body = await req.json();
    const minimumProgress = Math.min(100, Math.max(0, Math.round(Number(body.minimumProgress ?? 100))));
    if (!Number.isFinite(minimumProgress)) return new NextResponse("Invalid minimum progress", { status: 400 });
    const rule = await db.courseCompletionRule.upsert({ where: { courseId: params.courseId }, update: { requireAllLessons: body.requireAllLessons !== false, minimumProgress, requireAllQuizzes: !!body.requireAllQuizzes }, create: { courseId: params.courseId, requireAllLessons: body.requireAllLessons !== false, minimumProgress, requireAllQuizzes: !!body.requireAllQuizzes } });
    await db.course.update({ where: { id: params.courseId }, data: { completionMinProgress: minimumProgress } });
    return NextResponse.json(rule);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
