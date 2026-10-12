import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { user } = await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE);
    const quizzes = await db.quiz.findMany({
      where: { courseId: params.courseId, ...(user.role === "ADMIN" ? {} : {}) },
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { position: "asc" },
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const body = await req.json();
    if (!body.title?.trim()) return new NextResponse("Quiz title is required", { status: 400 });
    const passingScore = Number(body.passingScore ?? 70);
    const maxAttempts = Number(body.maxAttempts ?? 3);
    if (!Number.isInteger(passingScore) || passingScore < 0 || passingScore > 100) {
      return new NextResponse("Passing score must be between 0 and 100", { status: 400 });
    }
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) {
      return new NextResponse("Maximum attempts must be between 1 and 20", { status: 400 });
    }
    const last = await db.quiz.findFirst({ where: { courseId: params.courseId }, orderBy: { position: "desc" } });
    const quiz = await db.quiz.create({
      data: {
        courseId: params.courseId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        passingScore,
        maxAttempts,
        position: (last?.position || 0) + 1,
        isPublished: false,
        requiredForCompletion: !!body.requiredForCompletion,
      },
    });
    return NextResponse.json(quiz);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
