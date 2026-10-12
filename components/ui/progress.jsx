"use client";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const progressVariants = cva("h-full w-full flex-1 transition-all duration-300 ease-out", {
  variants: {
    variant: {
      default: "bg-ochre-500",
      success: "bg-sage-600",
      lapis: "bg-lapis-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const Progress = React.forwardRef(({ className, value, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-parchment-200/80 border border-ink-100",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressVariants({ variant }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
