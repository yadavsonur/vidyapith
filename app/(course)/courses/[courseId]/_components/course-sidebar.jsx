import { db } from "@/lib/db";
import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseProgress } from "@/components/course-progress";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export const CourseSidebar = async ({ course, progressCount, userId }) => {
  const access = userId
    ? await Promise.all([
        db.purchase.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }),
        db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }),
      ])
    : [null, null];
  const hasAccess = access[1]?.status !== "CANCELLED" || access[0]?.status === "SUCCEEDED";

  return (
    <div className="h-full border-r border-ink-200/80 flex flex-col overflow-y-auto shadow-subtle bg-parchment-25 select-none">
      <div className="p-6 flex flex-col border-b border-ink-100 bg-white">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center text-[11px] font-mono text-ink-500 hover:text-ink-950 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Course Overview
        </Link>
        <h1 className="font-serif font-medium text-lg text-ink-950 leading-snug line-clamp-2">
          {course.title}
        </h1>
        {hasAccess && (
          <div className="mt-4 pt-3 border-t border-ink-100">
            <CourseProgress variant="success" value={progressCount} size="sm" />
          </div>
        )}
      </div>

      <div className="flex-1 py-3 px-2 flex flex-col w-full space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-ink-400">
          Curriculum Syllabus ({course.chapters.length})
        </div>
        {course.chapters.map((chapter, index) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            index={index + 1}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !hasAccess}
          />
        ))}
      </div>
    </div>
  );
};
