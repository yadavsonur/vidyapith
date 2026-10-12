"use client";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const CourseSidebarItem = ({
  label,
  id,
  index,
  isCompleted,
  courseId,
  isLocked,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const Icon = isLocked ? Lock : isCompleted ? CheckCircle2 : PlayCircle;
  const isActive = pathname?.includes(id);

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "group relative flex items-center gap-x-2.5 w-full text-left text-xs font-medium px-3.5 py-2.5 rounded-md transition-all duration-150 text-ink-600 hover:text-ink-950 hover:bg-parchment-100",
        isActive &&
          "text-ink-950 font-semibold bg-white shadow-subtle border border-ink-200/80",
        isCompleted && "text-ink-700",
        isLocked && "opacity-75"
      )}
    >
      <Icon
        size={16}
        className={cn(
          "text-ink-400 group-hover:text-ink-700 transition-colors shrink-0",
          isActive && "text-ochre-600",
          isCompleted && "text-sage-600"
        )}
      />

      <span className="font-mono text-[11px] text-ink-400 shrink-0">
        {index !== undefined ? `${String(index).padStart(2, "0")}.` : ""}
      </span>

      <span className="truncate flex-1 font-sans">{label}</span>

      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-ochre-500 shrink-0" />
      )}
    </button>
  );
};
