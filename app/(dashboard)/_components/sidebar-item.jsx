"use client";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export const SidebarItem = ({ icon: Icon, label, href }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "group relative flex items-center gap-x-3 w-full text-left text-xs font-medium px-4 py-2.5 mx-0 my-0.5 transition-all duration-150 text-ink-600 hover:text-ink-950 hover:bg-parchment-100/80 rounded-md",
        isActive &&
          "text-ink-950 font-semibold bg-white shadow-subtle border border-ink-200/70"
      )}
    >
      <div className="flex items-center gap-x-3 w-full">
        <Icon
          size={18}
          className={cn(
            "text-ink-400 group-hover:text-ink-700 transition-colors shrink-0",
            isActive && "text-ochre-600"
          )}
        />
        <span className="truncate">{label}</span>
      </div>

      {isActive && (
        <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-ochre-500" />
      )}
    </button>
  );
};
