import Link from "next/link";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { UserCheck, Globe, BookOpen, Star, Users, ArrowLeft } from "lucide-react";

const InstructorPage = async ({ params }) => {
  const user = await db.user.findUnique({
    where: { id: params.userId },
    include: { profile: true },
  });

  if (!user || !["TEACHER", "ADMIN"].includes(user.role))
    return (
      <div className="p-16 text-center max-w-md mx-auto space-y-4">
        <h2 className="font-serif text-2xl font-medium text-ink-950">
          Faculty Chair Not Found
        </h2>
        <p className="text-xs text-ink-500 font-mono">
          The requested instructor credentials are either inactive or unregistered.
        </p>
        <Link href="/search">
          <Button size="sm" variant="outline" className="border-ink-200">
            Return to Catalogue
          </Button>
        </Link>
      </div>
    );

  const [courses, reviews, students] = await Promise.all([
    db.course.findMany({
      where: {
        isPublished: true,
        OR: [{ userId: user.id }, { instructors: { some: { userId: user.id } } }],
      },
      include: {
        category: true,
        chapters: { where: { isPublished: true }, select: { id: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createAt: "desc" },
    }),
    db.courseReview.findMany({
      where: {
        course: {
          OR: [{ userId: user.id }, { instructors: { some: { userId: user.id } } }],
        },
      },
      select: { rating: true },
    }),
    db.enrollment.findMany({
      where: {
        course: {
          OR: [{ userId: user.id }, { instructors: { some: { userId: user.id } } }],
        },
      },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  const average = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <Link
        href="/search"
        className="inline-flex items-center text-xs font-mono text-ink-500 hover:text-ink-950 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
        Return to Catalog
      </Link>

      {/* Faculty Dossier Card */}
      <section className="relative overflow-hidden border border-ink-200/90 rounded-2xl bg-white p-8 md:p-12 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-ink-200 bg-parchment-100 text-ink-800 text-xs font-mono">
              <UserCheck className="h-3.5 w-3.5 text-ochre-700" />
              <span>Faculty Dossier</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-ink-950">
              {user.profile?.displayName || "Vidhyapith Faculty Chair"}
            </h1>

            <p className="text-base text-ink-600 font-sans font-medium">
              {user.profile?.headline || "Senior Academic Lecturer"}
            </p>

            <p className="text-xs md:text-sm text-ink-700 font-sans leading-relaxed whitespace-pre-wrap pt-2">
              {user.profile?.bio ||
                "This instructor has not authored a comprehensive public biography yet."}
            </p>

            {user.profile?.expertise && (
              <div className="pt-2 text-xs font-mono text-ink-600 flex flex-wrap items-center gap-2">
                <span className="text-ink-400 uppercase">Expertise:</span>
                {user.profile.expertise.split(",").map((exp, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-parchment-100 border border-ink-200 text-ink-800"
                  >
                    {exp.trim()}
                  </span>
                ))}
              </div>
            )}

            {user.profile?.website && (
              <div className="pt-2">
                <a
                  href={user.profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-700 hover:text-ink-950 underline underline-offset-4 decoration-ochre-500"
                >
                  <Globe className="h-3.5 w-3.5 text-ochre-600" />
                  <span>Visit Laboratory & Research Site</span>
                </a>
              </div>
            )}
          </div>

          {/* Metric Ledger Quad */}
          <div className="grid grid-cols-2 gap-3 min-w-[240px] shrink-0">
            <div className="rounded-xl border border-ink-200 bg-parchment-50 p-4 shadow-subtle space-y-1">
              <div className="font-serif text-3xl font-bold text-ink-950">
                {courses.length}
              </div>
              <div className="text-[11px] font-mono text-ink-500 uppercase">
                Curricula
              </div>
            </div>

            <div className="rounded-xl border border-ink-200 bg-parchment-50 p-4 shadow-subtle space-y-1">
              <div className="font-serif text-3xl font-bold text-ink-950">
                {students.length}
              </div>
              <div className="text-[11px] font-mono text-ink-500 uppercase">
                Scholars
              </div>
            </div>

            <div className="rounded-xl border border-ink-200 bg-parchment-50 p-4 shadow-subtle space-y-1">
              <div className="font-serif text-3xl font-bold text-ink-950 text-ochre-700">
                {average ? average.toFixed(1) : "—"}★
              </div>
              <div className="text-[11px] font-mono text-ink-500 uppercase">
                Evaluation
              </div>
            </div>

            <div className="rounded-xl border border-ink-200 bg-parchment-50 p-4 shadow-subtle space-y-1">
              <div className="font-serif text-3xl font-bold text-ink-950">
                {reviews.length}
              </div>
              <div className="text-[11px] font-mono text-ink-500 uppercase">
                Critiques
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Authored */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-ink-100">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
              Course Catalog
            </div>
            <h2 className="font-serif text-2xl font-medium text-ink-950">
              Authored Syllabi & Lectures
            </h2>
          </div>
          <Link href="/search">
            <Button size="sm" variant="outline" className="border-ink-200 text-xs">
              Catalogue View
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              imageUrl={course.imageUrl}
              chaptersLength={course.chapters.length}
              price={course.price}
              progress={null}
              category={course.category?.name}
              averageRating={
                course.reviews.length
                  ? course.reviews.reduce((s, r) => s + r.rating, 0) /
                    course.reviews.length
                  : 0
              }
              ratingCount={course.reviews.length}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default InstructorPage;
