import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { CheckCircle2, Clock3, Compass, GraduationCap, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { CoursesList } from "@/components/courses-list";
import InfoCard from "./_components/info-card";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { getCourses } from "@/actions/get-courses";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    const { items: featured } = await getCourses({ sort: "popular" });
    return (
      <div className="p-6 md:p-10 space-y-12 max-w-7xl mx-auto">
        {/* Editorial Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-ink-200/90 bg-gradient-to-br from-white via-parchment-50 to-parchment-100 p-8 md:p-14 shadow-card">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-ochre-100/40 blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ochre-300/80 bg-ochre-50/70 text-ochre-900 text-xs font-mono mb-6">
              <GraduationCap className="h-3.5 w-3.5 text-ochre-700" />
              <span>Rigorous Curriculum & Continuous Mastery</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-ink-950 leading-[1.1]">
              The Classical Platform for <span className="italic underline decoration-ochre-500 decoration-2 underline-offset-4">Modern Craft</span>.
            </h1>

            <p className="mt-5 text-ink-600 font-sans text-base md:text-lg leading-relaxed max-w-2xl">
              Vidhyapith pairs academic depth with practical engineering. Study structured curricula, test retention through comprehensive assessments, and archive your lifelong learning transcript.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/search">
                <Button size="lg" className="bg-ink-900 text-parchment-50 hover:bg-ink-800 font-medium">
                  Explore Curricula
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-ink-200 text-ink-900 bg-white hover:bg-parchment-100">
                  Begin Journey
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Curated Courses */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-ink-200/80 gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
                Catalogue Highlights
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink-950 mt-1">
                Popular Treatises & Syllabi
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs font-mono text-ink-600 hover:text-ink-950 underline underline-offset-4 decoration-ink-300 hover:decoration-ink-950"
            >
              Browse All Courses →
            </Link>
          </div>

          <CoursesList items={featured.slice(0, 8)} />
        </section>
      </div>
    );
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(userId);

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Header Desk */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ink-200/80">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
            Scholar Workspace
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950 mt-1">
            My Learning Journal
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
            Resume your active coursework, review passed chapters, or verify assessments.
          </p>
        </div>

        <Link href="/search">
          <Button size="sm" variant="outline" className="border-ink-200 bg-white">
            <Compass className="h-3.5 w-3.5 mr-1.5 text-ochre-600" />
            Find New Courses
          </Button>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock3}
          label="Coursework In Progress"
          numberOfItems={coursesInProgress.length}
        />
        <InfoCard
          icon={CheckCircle2}
          label="Completed Curriculum"
          numberOfItems={completedCourses.length}
          variant="success"
        />
      </div>

      {/* Active Courses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-ink-100">
          <h2 className="font-serif text-xl font-medium text-ink-950">
            Active Study
          </h2>
          <span className="font-mono text-xs text-ink-500">
            {coursesInProgress.length} {coursesInProgress.length === 1 ? "track" : "tracks"}
          </span>
        </div>
        <CoursesList items={coursesInProgress} />
      </section>

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
            <h2 className="font-serif text-xl font-medium text-ink-950">
              Completed Qualifications
            </h2>
            <span className="font-mono text-xs text-ink-500">
              {completedCourses.length} achieved
            </span>
          </div>
          <CoursesList items={completedCourses} />
        </section>
      )}

      {/* Empty State */}
      {coursesInProgress.length === 0 && completedCourses.length === 0 && (
        <div className="rounded-xl border border-dashed border-ink-300 bg-white/70 p-12 text-center max-w-lg mx-auto shadow-subtle">
          <div className="mx-auto h-12 w-12 rounded-full bg-parchment-100 flex items-center justify-center text-ochre-700 mb-4 border border-ink-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="font-serif text-lg font-medium text-ink-900">
            Your study journal is currently empty
          </h3>
          <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto font-sans">
            Enroll in an academic course or explore beginner-friendly introductory treatises from our faculty.
          </p>
          <div className="mt-6">
            <Link href="/search">
              <Button size="sm" className="bg-ink-900 text-parchment-50">
                <Compass className="h-3.5 w-3.5 mr-2" />
                Browse Course Catalog
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
