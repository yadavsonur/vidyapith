import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star, Users, ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "./course-progress";

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  averageRating = 0,
  ratingCount = 0,
  enrollmentCount = 0,
}) => {
  const isEnrolled = progress !== null && progress !== undefined;

  return (
    <Link href={`/courses/${id}`} className="group block h-full">
      <article className="h-full flex flex-col bg-white border border-ink-200/90 rounded-lg overflow-hidden shadow-subtle hover:shadow-card hover:border-ink-400 transition-all duration-200">
        {/* Course Cover Image with Category Tag */}
        <div className="relative w-full aspect-[16/10] bg-parchment-100 overflow-hidden border-b border-ink-100">
          {imageUrl ? (
            <Image
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
              alt={title}
              src={imageUrl}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-parchment-100 to-parchment-200">
              <span className="font-serif italic text-ink-300 text-sm">Vidhyapith Folio</span>
            </div>
          )}

          {/* Micro Category Pill */}
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold bg-white/95 text-ink-800 border border-ink-200 shadow-sm backdrop-blur-sm">
              {category || "General"}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="h-7 w-7 rounded-full bg-ink-950 text-parchment-50 flex items-center justify-center shadow-md">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col p-4 justify-between">
          <div>
            <h3 className="font-serif font-bold text-base md:text-lg text-ink-950 leading-snug line-clamp-2 group-hover:text-ochre-700 transition-colors">
              {title}
            </h3>

            {/* Meta Row: Chapters, Rating, Learners */}
            <div className="mt-3 pt-3 border-t border-ink-100/80 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-ink-500 font-mono">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-ink-400" />
                <span>
                  {chaptersLength} {chaptersLength === 1 ? "lesson" : "lessons"}
                </span>
              </div>

              {ratingCount > 0 && (
                <div className="flex items-center gap-1 text-ink-700">
                  <Star className="h-3.5 w-3.5 fill-ochre-500 text-ochre-500" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-ink-400">({ratingCount})</span>
                </div>
              )}

              {enrollmentCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-ink-400" />
                  <span>{enrollmentCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer: Price or Progress */}
          <div className="mt-4 pt-3 border-t border-ink-100">
            {isEnrolled ? (
              <CourseProgress
                variant={progress >= 100 ? "success" : "default"}
                size="sm"
                value={progress}
              />
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-mono uppercase text-ink-400">Tuition</span>
                <span className="font-mono text-sm font-semibold text-ink-900">
                  {price === 0 ? "Free Access" : formatPrice(price)}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};
