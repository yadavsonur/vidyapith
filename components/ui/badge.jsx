import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase font-mono transition-colors",
  {
    variants: {
      variant: {
        default:
          "border border-ink-800 bg-ink-900 text-parchment-50",
        secondary:
          "border border-ink-200 bg-parchment-100 text-ink-700",
        destructive:
          "border border-vermilion-200 bg-vermilion-50 text-vermilion-700",
        outline:
          "border border-ink-300 text-ink-800 bg-white",
        success:
          "border border-sage-200 bg-sage-50 text-sage-700",
        ochre:
          "border border-ochre-300 bg-ochre-50 text-ochre-800",
        lapis:
          "border border-lapis-200 bg-lapis-50 text-lapis-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
