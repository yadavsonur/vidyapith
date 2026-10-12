import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuizBuilder } from "./_components/quiz-builder";

const QuizBuilderPage = async ({ params }) => {
  await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE);
  const quiz = await db.quiz.findFirst({ where: { id: params.quizId, courseId: params.courseId }, include: { questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } } } });
  if (!quiz) return <div className="p-6">Quiz not found.</div>;
  return <div className="p-6 max-w-5xl mx-auto"><QuizBuilder courseId={params.courseId} initialQuiz={quiz} /></div>;
};
export default QuizBuilderPage;
