"use client";
import qs from "query-string";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  }, [debouncedValue, currentCategoryId, router, pathname]);

  return (
    <div className="relative group">
      <Search className="h-3.5 w-3.5 absolute top-3 left-3 text-ink-400 group-hover:text-ink-700 transition-colors pointer-events-none" />
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full md:w-[280px] lg:w-[320px] pl-9 h-9 text-xs rounded-md bg-parchment-50 border-ink-200/90 focus-visible:bg-white focus-visible:border-ink-800 focus-visible:ring-1 focus-visible:ring-ink-800 transition-all placeholder:text-ink-400 font-sans"
        placeholder="Search treatises, skills, or mentors..."
      />
      <kbd className="hidden lg:inline-flex absolute right-2.5 top-2.5 px-1.5 py-0.5 text-[9px] font-mono text-ink-400 bg-white border border-ink-200 rounded pointer-events-none">
        /
      </kbd>
    </div>
  );
};
