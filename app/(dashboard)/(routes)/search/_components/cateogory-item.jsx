"use client";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

export const CategoryItem = ({ label, value, icon: Icon }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchparams = useSearchParams();

  const currentCategoryId = searchparams.get("categoryId");
  const currentTitle = searchparams.get("title");
  const isSelected = currentCategoryId === value;

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          title: currentTitle,
          categoryId: isSelected ? null : value,
        },
      },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(url);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "py-1.5 px-3 text-xs font-mono font-medium border border-ink-200/90 rounded-md flex items-center gap-x-2 bg-white text-ink-700 transition-all duration-150 hover:border-ink-400 hover:text-ink-950 shadow-subtle shrink-0",
        isSelected &&
          "border-ink-900 bg-ink-900 text-parchment-50 shadow-sm hover:bg-ink-800 hover:text-parchment-50"
      )}
      type="button"
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
      <span className="truncate">{label}</span>
      {isSelected && (
        <span className="h-1.5 w-1.5 rounded-full bg-ochre-400 shrink-0" />
      )}
    </button>
  );
};
