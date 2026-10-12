import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { QuizPlayer } from "./_components/quiz-player";

const QuizPage = async ({ params }) => {
  const user = await requireAuth();
  const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
  if (!hasAccess) return <div className="p-6">Enroll in this course to take quizzes.</div>;
  const quiz = await db.quiz.findFirst({ where: { id: params.quizId, courseId: params.courseId, isPublished: true }, include: { questions: { orderBy: { position: "asc" }, select: { id: true, text: true, type: true, points: true, options: { orderBy: { position: "asc" }, select: { id: true, text: true } } } }, _count: { select: { attempts: true } } } });
  if (!quiz) return <div className="p-6">Quiz not found.</div>;
  const attempts = await db.quizAttempt.count({ where: { quizId: quiz.id, userId: user.id } });
  return <div className="p-6 max-w-4xl mx-auto"><QuizPlayer courseId={params.courseId} quiz={quiz} attemptsUsed={attempts} /></div>;
};
export default QuizPage;
