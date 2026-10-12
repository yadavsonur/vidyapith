import { IconBadge } from "@/components/icon-badge";
import { cn } from "@/lib/utils";

export const InfoCard = ({ variant, icon: Icon, numberOfItems, label }) => {
  return (
    <div className="rounded-lg border border-ink-200/90 bg-white p-4 shadow-subtle flex items-center gap-x-4 hover:border-ink-300 transition-colors">
      <IconBadge variant={variant === "success" ? "success" : "ochre"} icon={Icon} />
      <div>
        <p className="text-[11px] font-mono uppercase tracking-wider text-ink-500">
          {label}
        </p>
        <p className="font-serif text-2xl font-bold text-ink-950 mt-0.5">
          {numberOfItems}{" "}
          <span className="font-sans text-xs font-normal text-ink-500">
            {numberOfItems === 1 ? "Course" : "Courses"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default InfoCard;
