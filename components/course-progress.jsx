import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const colorByVariant = {
  default: "text-ochre-700",
  success: "text-sage-700",
};

const progressVariantMap = {
  default: "default",
  success: "success",
};

const sizeByVariant = {
  default: "text-xs",
  sm: "text-[11px]",
};

export const CourseProgress = ({ value, variant = "default", size = "default" }) => {
  const percentage = Math.round(Number(value) || 0);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-mono">
        <span className={cn("font-medium tracking-tight", colorByVariant[variant], sizeByVariant[size])}>
          {percentage}% completed
        </span>
        <span className="text-[10px] text-ink-400 font-mono">
          {percentage === 100 ? "Complete" : "In Progress"}
        </span>
      </div>
      <Progress
        className="h-1.5"
        variant={progressVariantMap[variant] || "default"}
        value={value}
      />
    </div>
  );
};
