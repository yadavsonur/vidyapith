import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const existing = await db.quizQuestion.findFirst({ where: { id: params.questionId, quizId: params.quizId, quiz: { courseId: params.courseId } }, include: { options: true } });
    if (!existing) return new NextResponse("Question not found", { status: 404 });
    const body = await req.json();
    const options = Array.isArray(body.options) ? body.options : null;
    if (options && !options.some((option) => option.isCorrect)) return new NextResponse("At least one correct option is required", { status: 400 });
    await db.quizQuestion.update({ where: { id: existing.id }, data: {
      ...(body.text !== undefined ? { text: String(body.text).trim() } : {}),
      ...(body.points !== undefined ? { points: Math.max(1, Math.round(Number(body.points))) } : {}),
    }});
    if (options) {
      await db.quizOption.deleteMany({ where: { questionId: existing.id } });
      await db.quizOption.createMany({ data: options.map((option, index) => ({ questionId: existing.id, text: String(option.text || "").trim(), isCorrect: !!option.isCorrect, position: index + 1 })) });
    }
    const question = await db.quizQuestion.findUnique({ where: { id: existing.id }, include: { options: { orderBy: { position: "asc" } } } });
    return NextResponse.json(question);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const existing = await db.quizQuestion.findFirst({ where: { id: params.questionId, quizId: params.quizId, quiz: { courseId: params.courseId } } });
    if (!existing) return new NextResponse("Question not found", { status: 404 });
    await db.quizQuestion.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
