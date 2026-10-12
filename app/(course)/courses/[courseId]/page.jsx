import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";
import { CourseEnrollButton } from "./chapters/[chapterId]/_components/course-enroll-button";
import { CourseReviewForm } from "./_components/course-review-form";
import { CourseAnnouncements } from "./_components/course-announcements";
import { CourseProgress } from "@/components/course-progress";
import { DiscussionPanel } from "./_components/discussion-panel";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Star,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  UserCheck,
} from "lucide-react";

const CourseIdPage = async ({ params }) => {
  const { userId } = auth();
  const chapterInclude = userId ? { userProgress: { where: { userId } } } : {};
  const course = await db.course.findUnique({
    where: { id: params.courseId, isPublished: true },
    include: {
      category: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: chapterInclude,
      },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { include: { profile: true, studentProfile: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      announcements: {
        where: { isPublished: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
      instructors: {
        include: { user: { include: { profile: true, studentProfile: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { enrollments: true } },
      quizzes: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  if (!course) return redirect("/");

  const ownerProfile = await db.instructorProfile.findUnique({
    where: { userId: course.userId },
  });

  let enrollment = null;
  let purchase = null;
  let progress = 0;
  let existingReview = null;

  if (userId) {
    [enrollment, purchase, existingReview] = await Promise.all([
      db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      }),
      db.purchase.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      }),
      db.courseReview.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      }),
    ]);
    if (enrollment || purchase) progress = await getProgress(userId, course.id);
  }

  const ratings = course.reviews.map((review) => review.rating);
  const averageRating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;
  const continueChapter =
    course.chapters.find((chapter) => !chapter.userProgress?.[0]?.isCompleted) ||
    course.chapters[0];
  const hasAccess =
    enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED" ||
    purchase?.status === "SUCCEEDED";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      {/* Editorial Course Folio Hero */}
      <section className="relative overflow-hidden border border-ink-200/90 rounded-2xl bg-gradient-to-br from-white via-parchment-50 to-parchment-100 p-8 md:p-12 shadow-card">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-ink-200 bg-white text-ink-800 text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-ochre-500" />
            <span>{course.category?.name || "General Discipline"}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-ink-950 leading-[1.15]">
            {course.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-ink-500 pt-1">
            <span className="flex items-center gap-1.5 text-ink-700">
              <BookOpen className="h-3.5 w-3.5 text-ink-400" />
              {course.chapters.length} Lectures & Chapters
            </span>
            <span className="flex items-center gap-1.5 text-ink-700">
              <Users className="h-3.5 w-3.5 text-ink-400" />
              {course._count.enrollments} Matriculated Scholars
            </span>
            <span className="flex items-center gap-1.5 text-ink-700">
              <Star className="h-3.5 w-3.5 fill-ochre-500 text-ochre-500" />
              {averageRating ? averageRating.toFixed(1) : "No rating yet"}
              {ratings.length ? ` (${ratings.length} reviews)` : ""}
            </span>
          </div>

          <p className="text-sm md:text-base text-ink-700 font-sans leading-relaxed whitespace-pre-wrap max-w-2xl pt-2">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            {hasAccess && continueChapter ? (
              <Link href={`/courses/${course.id}/chapters/${continueChapter.id}`}>
                <Button size="lg" className="bg-ink-900 text-parchment-50 hover:bg-ink-800">
                  <span>Resume Curriculum</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <CourseEnrollButton courseId={course.id} price={course.price} />
            )}

            {ownerProfile && (
              <Link href={`/instructors/${course.userId}`}>
                <Button size="lg" variant="outline" className="border-ink-200 text-ink-900 bg-white">
                  <UserCheck className="h-4 w-4 mr-2" />
                  About Faculty Chair
                </Button>
              </Link>
            )}
          </div>

          {hasAccess && (
            <div className="pt-4 max-w-sm">
              <CourseProgress
                value={progress}
                variant={progress >= 100 ? "success" : "default"}
              />
            </div>
          )}
        </div>
      </section>

      {/* Curriculum Outline / Chapters Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-ink-100">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
              Sequential Syllabus
            </div>
            <h2 className="font-serif text-2xl font-medium text-ink-950">
              Curriculum Outline
            </h2>
          </div>
          <span className="font-mono text-xs text-ink-400">
            {course.chapters.length} Lectures Total
          </span>
        </div>

        <div className="border border-ink-200/90 rounded-xl overflow-hidden bg-white shadow-subtle divide-y divide-ink-100">
          {course.chapters.map((chapter, index) => {
            const isCompleted = !!chapter.userProgress?.[0]?.isCompleted;
            return (
              <div
                key={chapter.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-parchment-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-ink-400 w-6">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                  <div className="min-w-0">
                    <div className="font-serif font-medium text-base text-ink-950 truncate">
                      {chapter.title}
                    </div>
                    <div className="text-[11px] font-mono text-ink-400 mt-0.5">
                      {chapter.isFree ? (
                        <span className="text-ochre-700">Gratis Public Preview</span>
                      ) : (
                        "Matriculated scholars only"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isCompleted && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-sage-700 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </span>
                  )}
                  <Link href={`/courses/${course.id}/chapters/${chapter.id}`}>
                    <Button size="sm" variant="outline" className="border-ink-200 text-xs">
                      {hasAccess || chapter.isFree ? "Enter Lesson" : "Details"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Faculty Instructors */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-ink-100">
          <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
            Instructional Faculty
          </div>
          <h2 className="font-serif text-2xl font-medium text-ink-950">
            Course Directors & Co-Chairs
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {course.instructors.length ? (
            course.instructors.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/instructors/${assignment.userId}`}
                className="border border-ink-200/90 rounded-xl p-5 bg-white hover:border-ink-400 hover:shadow-subtle transition-all"
              >
                <div className="font-serif font-medium text-base text-ink-950">
                  {assignment.user.profile?.displayName ||
                    (assignment.userId === course.userId
                      ? ownerProfile?.displayName
                      : "Instructor") ||
                    assignment.userId}
                </div>
                <div className="text-[11px] font-mono text-ochre-700 uppercase tracking-wider mt-1">
                  {assignment.role}
                </div>
                <div className="text-xs text-ink-600 mt-2 font-sans line-clamp-2">
                  {assignment.user.profile?.headline || "Faculty Member"}
                </div>
              </Link>
            ))
          ) : (
            <Link
              href={`/instructors/${course.userId}`}
              className="border border-ink-200/90 rounded-xl p-5 bg-white hover:border-ink-400 hover:shadow-subtle transition-all"
            >
              <div className="font-serif font-medium text-base text-ink-950">
                {ownerProfile?.displayName || "Primary Course Chair"}
              </div>
              <div className="text-xs text-ink-600 mt-1 font-sans">
                {ownerProfile?.headline || "Faculty Member"}
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Announcements */}
      {hasAccess && <CourseAnnouncements announcements={course.announcements} />}

      {/* Assessments */}
      {hasAccess && course.quizzes.length > 0 && (
        <section className="space-y-4">
          <div className="pb-2 border-b border-ink-100">
            <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
              Formal Examinations
            </div>
            <h2 className="font-serif text-2xl font-medium text-ink-950">
              Assessments & Quizzes
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {course.quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/courses/${course.id}/quizzes/${quiz.id}`}
                className="border border-ink-200/90 rounded-xl p-5 bg-white hover:border-ink-400 hover:shadow-subtle transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-serif font-medium text-base text-ink-950">
                    {quiz.title}
                  </div>
                  <div className="text-xs font-mono text-ink-500 mt-1">
                    {quiz._count.questions} questions · Passing mark: {quiz.passingScore}%
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between text-xs font-mono text-ochre-700">
                  <span>Take Assessment →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Review Submission */}
      {userId && hasAccess && (
        <CourseReviewForm
          courseId={course.id}
          existingReview={existingReview}
        />
      )}

      {/* Recent Reviews */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-ink-100">
          <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
            Peer Feedback
          </div>
          <h2 className="font-serif text-2xl font-medium text-ink-950">
            Scholar Reviews & Evaluations
          </h2>
        </div>

        {course.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-xs font-mono text-ink-400">
            No peer critiques or scholar reviews filed yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {course.reviews.slice(0, 8).map((review) => (
              <article
                key={review.id}
                className="border border-ink-200/90 rounded-xl p-5 bg-white shadow-subtle space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-medium text-sm text-ink-950">
                    {review.user.studentProfile?.displayName || review.user.profile?.displayName || "Anonymous Scholar"}
                  </span>
                  <span className="text-ochre-500 font-mono text-xs tracking-tighter">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p className="text-xs text-ink-700 font-sans leading-relaxed">
                  {review.review || "No written critique provided."}
                </p>
                <div className="text-[10px] font-mono text-ink-400 pt-1">
                  Verified Enrollment
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {hasAccess && <DiscussionPanel courseId={course.id} />}
    </div>
  );
};

export default CourseIdPage;
