import { db } from "@/lib/db";
import { Categories } from "./_components/categories";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { CourseFilters } from "./_components/course-filters";
import { Compass } from "lucide-react";

const SearchPage = async ({ searchParams }) => {
  const [categories, instructors] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({
      where: { role: "TEACHER" },
      include: { profile: true },
      orderBy: { id: "asc" },
    }),
  ]);

  const result = await getCourses({ ...searchParams, page: searchParams.page || 1, pageSize: 24 });
  const courses = result.items;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-ink-200/80 pb-6">
        <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
          <Compass className="h-3.5 w-3.5" />
          <span>Academic Compendium</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
          Browse Catalog & Disciplines
        </h1>
        <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
          Select topic taxonomies, review syllabus outlines, and inspect course tuition.
        </p>
      </div>

      <div className="md:hidden block">
        <SearchInput />
      </div>

      {/* Taxonomies / Categories Carousel Bar */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-ink-400">
          Disciplines
        </div>
        <Categories items={categories} />
      </div>

      {/* Structured Filter Tool */}
      <CourseFilters categories={categories} instructors={instructors} />

      {/* Results Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-ink-100 font-mono text-xs text-ink-500">
          <span>Available Curricula</span>
          <span>{result.total} Results · Page {result.page} of {Math.max(1, result.pages)}</span>
        </div>
        <CoursesList items={courses} />
        {result.pages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 text-xs font-mono">
            {result.page > 1 && <a href={`?${new URLSearchParams({ ...searchParams, page: String(result.page - 1) }).toString()}`} className="underline">← Previous</a>}
            {result.page < result.pages && <a href={`?${new URLSearchParams({ ...searchParams, page: String(result.page + 1) }).toString()}`} className="underline">Next →</a>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
