import { db } from "@/lib/db";
import { requireAuth, requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { NextResponse } from "next/server";

const teacherInclude = {
  questions: {
    orderBy: { position: "asc" },
    include: { options: { orderBy: { position: "asc" } } },
  },
  _count: { select: { questions: true, attempts: true } },
};

export async function GET(req, { params }) {
  try {
    const user = await requireAuth();
    let staff = false;
    try { await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE); staff = true; } catch {}
    const access = await hasCourseAccess(user.id, params.courseId);
    if (!access.hasAccess && !staff) return new NextResponse("Forbidden", { status: 403 });
    const quiz = await db.quiz.findFirst({
      where: { id: params.quizId, courseId: params.courseId, isPublished: true },
      include: {
        questions: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            text: true,
            type: true,
            points: true,
            position: true,
            options: { orderBy: { position: "asc" }, select: { id: true, text: true, position: true } },
          },
        },
      },
    });
    if (!quiz) return new NextResponse("Quiz not found", { status: 404 });
    return NextResponse.json({ ...quiz, userId: user.id });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const existing = await db.quiz.findFirst({ where: { id: params.quizId, courseId: params.courseId } });
    if (!existing) return new NextResponse("Quiz not found", { status: 404 });
    const body = await req.json();
    const data = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.passingScore !== undefined) data.passingScore = Math.min(100, Math.max(0, Math.round(Number(body.passingScore))));
    if (body.maxAttempts !== undefined) data.maxAttempts = Math.min(20, Math.max(1, Math.round(Number(body.maxAttempts))));
    if (body.isPublished !== undefined) data.isPublished = !!body.isPublished;
    if (body.requiredForCompletion !== undefined) data.requiredForCompletion = !!body.requiredForCompletion;
    const quiz = await db.quiz.update({ where: { id: existing.id }, data, include: teacherInclude });
    return NextResponse.json(quiz);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const existing = await db.quiz.findFirst({ where: { id: params.quizId, courseId: params.courseId } });
    if (!existing) return new NextResponse("Quiz not found", { status: 404 });
    await db.quiz.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
