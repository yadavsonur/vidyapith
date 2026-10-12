import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

const validTypes = new Set(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]);

export async function POST(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const quiz = await db.quiz.findFirst({ where: { id: params.quizId, courseId: params.courseId } });
    if (!quiz) return new NextResponse("Quiz not found", { status: 404 });
    const body = await req.json();
    if (!body.text?.trim() || !validTypes.has(body.type)) return new NextResponse("Question text and valid type are required", { status: 400 });
    const options = Array.isArray(body.options) ? body.options : [];
    if (options.length < 2) return new NextResponse("At least two options are required", { status: 400 });
    if (!options.some((option) => option.isCorrect)) return new NextResponse("At least one correct option is required", { status: 400 });
    if (body.type === "SINGLE_CHOICE" || body.type === "TRUE_FALSE") {
      if (options.filter((option) => option.isCorrect).length !== 1) return new NextResponse("This question type must have exactly one correct option", { status: 400 });
    }
    const last = await db.quizQuestion.findFirst({ where: { quizId: quiz.id }, orderBy: { position: "desc" } });
    const question = await db.quizQuestion.create({
      data: {
        quizId: quiz.id,
        text: body.text.trim(),
        type: body.type,
        points: Math.max(1, Math.round(Number(body.points || 1))),
        position: (last?.position || 0) + 1,
        options: {
          create: options.map((option, index) => ({
            text: String(option.text || "").trim(),
            isCorrect: !!option.isCorrect,
            position: index + 1,
          })),
        },
      },
      include: { options: { orderBy: { position: "asc" } } },
    });
    return NextResponse.json(question);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
