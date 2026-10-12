import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const backgroundVariants = cva(
  "rounded-md flex items-center justify-center transition-colors duration-150 border",
  {
    variants: {
      variant: {
        default: "bg-parchment-100 border-ink-200/80 text-ink-900",
        success: "bg-sage-50 border-sage-200 text-sage-700",
        ochre: "bg-ochre-50 border-ochre-200 text-ochre-800",
        lapis: "bg-lapis-50 border-lapis-200 text-lapis-700",
      },
      size: {
        default: "p-2.5",
        sm: "p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-ink-800",
      success: "text-sage-700",
      ochre: "text-ochre-700",
      lapis: "text-lapis-700",
    },
    size: {
      default: "h-5 w-5",
      sm: "h-3.5 w-3.5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export const IconBadge = ({ icon: Icon, variant, size }) => {
  return (
    <div className={cn(backgroundVariants({ variant, size }))}>
      <Icon className={cn(iconVariants({ variant, size }))} />
    </div>
  );
};
