import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "border text-xs font-mono uppercase tracking-wider py-2.5 px-4 flex items-center justify-center w-full shadow-subtle gap-x-2 select-none",
  {
    variants: {
      variant: {
        warning:
          "bg-ochre-50 border-ochre-300/80 text-ochre-900",
        success:
          "bg-sage-50 border-sage-300/80 text-sage-900",
        info:
          "bg-parchment-100 border-ink-200 text-ink-800",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export const Banner = ({ label, variant }) => {
  const Icon = iconMap[variant || "warning"] || AlertTriangle;
  return (
    <div className={cn(bannerVariants({ variant }))}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </div>
  );
};
