import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { scoreQuiz } from "@/lib/quiz";
import { NextResponse } from "next/server";
import { finalizeCourseCompletion } from "@/lib/services/completion";

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
    if (!hasAccess) return new NextResponse("Enroll in the course before taking this quiz", { status: 403 });

    const quiz = await db.quiz.findFirst({
      where: { id: params.quizId, courseId: params.courseId, isPublished: true },
      include: { questions: { orderBy: { position: "asc" }, include: { options: true } } },
    });
    if (!quiz) return new NextResponse("Quiz not found", { status: 404 });

    const attemptCount = await db.quizAttempt.count({ where: { quizId: quiz.id, userId: user.id } });
    if (attemptCount >= quiz.maxAttempts) return new NextResponse("Maximum quiz attempts reached", { status: 400 });

    const body = await req.json();
    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
    const { score } = scoreQuiz(quiz.questions, answers);
    const passed = score >= quiz.passingScore;

    const attempt = await db.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score,
        passed,
        completedAt: new Date(),
        answers: {
          create: quiz.questions.map((question) => ({
            questionId: question.id,
            selectedIds: Array.isArray(answers[question.id]) ? answers[question.id] : [],
            isCorrect: (() => {
              const correct = question.options.filter((option) => option.isCorrect).map((option) => option.id).sort();
              const selected = Array.isArray(answers[question.id]) ? [...new Set(answers[question.id].map(String))].sort() : [];
              return correct.length === selected.length && correct.every((id, index) => id === selected[index]);
            })(),
          })),
        },
      },
    });

    const completion = passed ? await finalizeCourseCompletion(user.id, params.courseId) : null;

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      passed,
      passingScore: quiz.passingScore,
      attemptsUsed: attemptCount + 1,
      attemptsRemaining: Math.max(0, quiz.maxAttempts - attemptCount - 1),
      completion,
    });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
