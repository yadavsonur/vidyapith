import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium tracking-tight ring-offset-parchment-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-ink-900 text-parchment-50 hover:bg-ink-800 shadow-sm hover:shadow",
        destructive:
          "bg-vermilion-600 text-white hover:bg-vermilion-700 shadow-sm",
        outline:
          "border border-ink-200 bg-white hover:bg-parchment-100 hover:border-ink-300 text-ink-800 shadow-subtle",
        secondary:
          "bg-parchment-100 text-ink-900 hover:bg-parchment-200 border border-parchment-200",
        ghost:
          "hover:bg-parchment-100 hover:text-ink-900 text-ink-700",
        link:
          "text-ink-900 underline-offset-4 hover:underline decoration-ochre-500",
        success:
          "bg-sage-600 text-white hover:bg-sage-700 shadow-sm",
        sky:
          "bg-lapis-800 text-white hover:bg-lapis-900 shadow-sm",
        ochre:
          "bg-ochre-500 text-ink-950 font-semibold hover:bg-ochre-600 shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
