import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { CircleDollarSign, FileText, LayoutDashboard, ListOrdered, GraduationCap, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";
import { InstructorManager } from "./_components/instructor-manager";
import { AnnouncementManager } from "./_components/announcement-manager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CompletionRulesForm } from "./_components/completion-rules-form";

const CourseIdPage = async ({ params }) => {
  let authorization;
  try {
    authorization = await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.VIEW_TEACHER_COURSE
    );
  } catch {
    return redirect("/");
  }

  const { user, courseRole } = authorization;
  const canEditCourse = user.role === "ADMIN" || ["OWNER", "EDITOR"].includes(courseRole);
  const canPublish = user.role === "ADMIN" || ["OWNER", "EDITOR"].includes(courseRole);
  const canDelete = user.role === "ADMIN" || courseRole === "OWNER";
  const canManageInstructors = user.role === "ADMIN" || courseRole === "OWNER";

  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      chapters: { orderBy: { position: "asc" } },
      attachement: { orderBy: { createdAt: "desc" } },
      instructors: { include: { user: { include: { profile: true } } }, orderBy: { createdAt: "asc" } },
      announcements: { orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] },
    },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  if (!course) return redirect("/");

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price !== null && course.price !== undefined,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && course.status === "PENDING_REVIEW" && (
        <Banner
          variant="warning"
          label="This course is awaiting administrator review and remains hidden from the public catalog."
        />
      )}
      {!course.isPublished && course.status !== "PENDING_REVIEW" && (
        <Banner
          variant="warning"
          label="This course is in draft mode. Complete the curriculum and submit it for administrator review."
        />
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Top Bar */}
        <div className="space-y-4">
          <Link
            href="/teacher/courses"
            className="inline-flex items-center text-xs font-mono text-ink-500 hover:text-ink-950 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Curriculum Roster
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-ink-200/80 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-parchment-100 border border-ink-200 text-ink-700">
                  Curriculum Editor
                </span>
                <span className="text-xs font-mono text-ink-500">
                  Readiness: <strong className="text-ink-900">{completionText}</strong> requirements
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
                {course.title || "Untitled Course"}
              </h1>
            </div>

            <Actions
              disabled={!isComplete}
              courseId={params.courseId}
              isPublished={course.isPublished}
              courseStatus={course.status}
              isAdmin={user.role === "ADMIN"}
              canPublish={canPublish}
              canDelete={canDelete}
            />
          </div>
        </div>

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Metadata & Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-x-2.5 pb-2 border-b border-ink-100">
              <IconBadge icon={LayoutDashboard} variant="ochre" />
              <div>
                <h2 className="font-serif text-xl font-medium text-ink-950">
                  Course Identity & Metadata
                </h2>
                <p className="text-xs text-ink-500">Essential taxonomy and descriptive copy</p>
              </div>
            </div>

            {canEditCourse ? (
              <div className="space-y-6">
                <TitleForm initialData={course} courseId={course.id} />
                <DescriptionForm initialData={course} courseId={course.id} />
                <ImageForm initialData={course} courseId={course.id} />
                <CategoryForm
                  initialData={course}
                  courseId={course.id}
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-ink-200 bg-parchment-50 p-5 text-xs text-ink-600 font-mono">
                Assigned as faculty co-instructor. Fundamental course identity is governed by the course creator.
              </div>
            )}
          </div>

          {/* Right Column: Chapters, Pricing, Resources, Assessments */}
          <div className="space-y-8">
            {/* Chapters Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-x-2.5 pb-2 border-b border-ink-100">
                <IconBadge icon={ListOrdered} variant="ochre" />
                <div>
                  <h2 className="font-serif text-xl font-medium text-ink-950">
                    Syllabus & Chapters
                  </h2>
                  <p className="text-xs text-ink-500">Organize sequential lectures and previews</p>
                </div>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>

            {/* Tuition Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-x-2.5 pb-2 border-b border-ink-100">
                <IconBadge icon={CircleDollarSign} variant="ochre" />
                <div>
                  <h2 className="font-serif text-xl font-medium text-ink-950">
                    Tuition & Access Fee
                  </h2>
                  <p className="text-xs text-ink-500">Configure lifetime or gratis pricing</p>
                </div>
              </div>
              {canEditCourse && <PriceForm initialData={course} courseId={course.id} />}
            </div>

            {/* Supplementary Materials Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-x-2.5 pb-2 border-b border-ink-100">
                <IconBadge icon={FileText} variant="ochre" />
                <div>
                  <h2 className="font-serif text-xl font-medium text-ink-950">
                    Supplementary Treatises & Assets
                  </h2>
                  <p className="text-xs text-ink-500">Readings, downloadable code files, or references</p>
                </div>
              </div>
              <AttachmentForm initialData={course} courseId={course.id} />
            </div>

            <CompletionRulesForm courseId={course.id} />

            {/* Quizzes Management Card */}
            <div className="rounded-lg border border-ink-200/90 bg-white p-5 shadow-subtle space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-medium text-base text-ink-950">
                    Assessments & Quizzes
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Configure knowledge tests, passing score thresholds, and attempt policies.
                  </p>
                </div>
                <Link href={`/teacher/courses/${course.id}/quizzes`}>
                  <Button size="sm" variant="outline" className="border-ink-200 text-xs">
                    Manage Assessments
                  </Button>
                </Link>
              </div>
            </div>

            {/* Instructors Collaboration */}
            {canManageInstructors && (
              <InstructorManager
                courseId={course.id}
                ownerId={course.userId}
                initialInstructors={course.instructors}
              />
            )}

            {/* Announcements */}
            <AnnouncementManager
              courseId={course.id}
              initialAnnouncements={course.announcements}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
