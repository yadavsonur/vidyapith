import { CourseCard } from "@/components/course-card";
import { BookOpen } from "lucide-react";

export const CoursesList = ({ items }) => (
  <div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((item) => (
        <CourseCard
          key={item.id}
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl}
          chaptersLength={item.chapters?.length || 0}
          price={item.price}
          progress={item.progress}
          category={item?.category?.name}
          averageRating={item.averageRating}
          ratingCount={item.ratingCount}
          enrollmentCount={item._count?.enrollments || 0}
        />
      ))}
    </div>

    {items.length === 0 && (
      <div className="rounded-xl border border-dashed border-ink-300 bg-white/60 p-12 text-center max-w-md mx-auto">
        <div className="mx-auto h-12 w-12 rounded-full bg-parchment-100 flex items-center justify-center text-ink-400 mb-3 border border-ink-200">
          <BookOpen className="h-5 w-5" />
        </div>
        <h4 className="font-serif font-medium text-base text-ink-900">No courses catalogued yet</h4>
        <p className="text-xs text-ink-500 mt-1 font-sans">
          Refine your filters, search for another discipline, or revisit soon for newly published cohorts.
        </p>
      </div>
    )}
  </div>
);
