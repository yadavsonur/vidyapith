import { BookOpen } from "lucide-react";

interface WelcomeCardProps {
  coursesInProgress: number;
  completedCourses: number;
}

export const WelcomeCard = ({
  coursesInProgress,
  completedCourses,
}: WelcomeCardProps) => {
  const message =
    coursesInProgress > 0
      ? `You have ${coursesInProgress} course${coursesInProgress === 1 ? "" : "s"} in progress.`
      : completedCourses > 0
        ? "Great work! Start another course to keep learning."
        : "Start exploring courses and build your learning journey.";

  return (
    <div className="rounded-xl border bg-slate-50 p-5">
      <div className="flex items-start gap-x-4">
        <div className="rounded-full bg-sky-100 p-3 text-sky-700">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
          {completedCourses > 0 && (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {completedCourses} course{completedCourses === 1 ? "" : "s"} completed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
