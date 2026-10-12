import Link from "next/link";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { QuizCreateForm } from "./_components/quiz-create-form";
import { ArrowLeft, CheckSquare, Edit3, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const QuizzesPage = async ({ params }) => {
  await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE);
  const quizzes = await db.quiz.findMany({
    where: { courseId: params.courseId },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { position: "asc" },
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link
          href={`/teacher/courses/${params.courseId}`}
          className="inline-flex items-center text-xs font-mono text-ink-500 hover:text-ink-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Curriculum Editor
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-ink-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Assessment Architecture</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
              Course Quizzes & Exams
            </h1>
            <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
              Create examinations, specify pass percentage standards, and review scholar submissions.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-ink-200/90 rounded-lg p-5 bg-white shadow-subtle space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
          Create New Assessment
        </div>
        <QuizCreateForm courseId={params.courseId} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-ink-500 uppercase tracking-wider px-1">
          <span>Configured Assessments ({quizzes.length})</span>
        </div>

        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/teacher/courses/${params.courseId}/quizzes/${quiz.id}`}
            className="block border border-ink-200/90 rounded-lg p-4 bg-white hover:border-ink-400 hover:shadow-subtle transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-serif font-medium text-base text-ink-950">
                  {quiz.title}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-ink-500">
                  <span>{quiz._count.questions} questions</span>
                  <span>·</span>
                  <span>{quiz._count.attempts} attempts logged</span>
                  <span>·</span>
                  <span className="font-medium text-ink-800">
                    {quiz.passingScore}% to pass
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={quiz.isPublished ? "success" : "secondary"}>
                  {quiz.isPublished ? "Published" : "Draft"}
                </Badge>
                <Button size="sm" variant="outline" className="border-ink-200 text-xs">
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  Edit Questions
                </Button>
              </div>
            </div>
          </Link>
        ))}

        {quizzes.length === 0 && (
          <div className="border border-dashed border-ink-200 rounded-lg p-10 text-center text-xs text-ink-400 font-mono">
            No examinations authored for this curriculum yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
