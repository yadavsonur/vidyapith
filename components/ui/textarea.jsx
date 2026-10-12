import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[90px] w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 shadow-subtle transition-all duration-150 focus-visible:outline-none focus-visible:border-ink-700 focus-visible:ring-1 focus-visible:ring-ink-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-parchment-100 font-sans",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
