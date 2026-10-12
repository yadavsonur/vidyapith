"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export const CourseFilters = ({ categories = [], instructors = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minRating: searchParams.get("minRating") || "",
    instructorId: searchParams.get("instructorId") || "",
    sort: searchParams.get("sort") || "newest",
  });

  const query = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(filters).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key)
    );
    return params.toString();
  }, [filters, searchParams]);

  const apply = () => router.push(`/search?${query}`);
  const clear = () =>
    router.push(
      `/search${
        searchParams.get("title")
          ? `?title=${encodeURIComponent(searchParams.get("title"))}`
          : ""
      }`
    );

  const hasActiveFilters =
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.instructorId ||
    filters.sort !== "newest";

  return (
    <div className="border border-ink-200/90 rounded-lg p-4 bg-white shadow-subtle space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ink-100">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-600">
          <SlidersHorizontal className="h-3.5 w-3.5 text-ochre-600" />
          <span>Filter & Sieve Catalogue</span>
        </div>
        {hasActiveFilters && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ochre-50 text-ochre-800 border border-ochre-200">
            Filters Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Min Price ($)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800 font-mono"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Max Price ($)
          </label>
          <input
            type="number"
            min="0"
            placeholder="Unlimited"
            className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800 font-mono"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Rating
          </label>
          <select
            className="w-full border border-ink-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
          >
            <option value="">Any evaluation</option>
            <option value="4">4.0★ & higher</option>
            <option value="3">3.0★ & higher</option>
            <option value="2">2.0★ & higher</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Instructor
          </label>
          <select
            className="w-full border border-ink-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={filters.instructorId}
            onChange={(e) => setFilters({ ...filters, instructorId: e.target.value })}
          >
            <option value="">All Faculty</option>
            {instructors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.profile?.displayName || item.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Order By
          </label>
          <select
            className="w-full border border-ink-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="newest">Latest Added</option>
            <option value="popular">Most Enrolled</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Tuition: Low to High</option>
            <option value="price_desc">Tuition: High to Low</option>
            <option value="oldest">Earliest Added</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-ink-100">
        <Button size="sm" onClick={apply} className="bg-ink-900 text-parchment-50">
          Apply Filter Criteria
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={clear}
          className="border-ink-200 text-ink-600 hover:text-ink-900"
        >
          <RotateCcw className="h-3 w-3 mr-1.5" />
          Reset
        </Button>
      </div>
    </div>
  );
};
