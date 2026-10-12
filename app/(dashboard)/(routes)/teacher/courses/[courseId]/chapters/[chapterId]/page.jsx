import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterAccesssForm } from "./_components/chapter-access-form";
import { ChapterVideoForm } from "./_components/chapter-video-form";
import { LessonSettingsForm } from "./_components/lesson-settings-form";
import { Banner } from "@/components/banner";
import { isMuxSigningConfigured, signMuxPlaybackToken } from "@/lib/mux";
import { ChapterActions } from "./_components/chapter-actions";
import { ChapterResourceForm } from "./_components/chapter-resource-form";

const ChapterIdPage = async ({ params }) => {
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
  const canPublish = user.role === "ADMIN" || ["OWNER", "EDITOR"].includes(courseRole);
  const canDelete = user.role === "ADMIN" || ["OWNER", "EDITOR", "INSTRUCTOR"].includes(courseRole);

  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: { muxData: true, resources: { orderBy: { createdAt: "desc" } } },
  });

  if (!chapter) return redirect("/");

  const playbackToken = chapter.muxData?.playbackId && isMuxSigningConfigured() ? signMuxPlaybackToken(chapter.muxData.playbackId) : null;
  const contentReady = ["ARTICLE", "TEXT"].includes(chapter.lessonType) ? !!(chapter.content || chapter.description) : chapter.lessonType === "MIXED" ? !!(chapter.videoUrl && (chapter.content || chapter.description)) : !!chapter.videoUrl;
  const requiredFields = [chapter.title, contentReady];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label="This chapter is currently in draft mode and not visible to students."
        />
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <Link
            href={`/teacher/courses/${params.courseId}`}
            className="inline-flex items-center text-xs font-mono text-ink-500 hover:text-ink-950 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Return to Curriculum Studio
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-ink-200/80 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-parchment-100 border border-ink-200 text-ink-700">
                  Chapter Editor
                </span>
                <span className="text-xs font-mono text-ink-500">
                  Readiness: <strong className="text-ink-900">{completionText}</strong> requirements
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
                {chapter.title || "Untitled Chapter"}
              </h1>
            </div>

            <ChapterActions
              disabled={!isComplete}
              courseId={params.courseId}
              chapterId={params.chapterId}
              isPublished={chapter.isPublished}
              canPublish={canPublish}
              canDelete={canDelete}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-x-2.5 pb-2 border-b border-ink-100">
              <IconBadge icon={LayoutDashboard} variant="ochre" />
              <div>
                <h2 className="font-serif text-xl font-medium text-ink-950">
                  Lecture Details & Synopsis
                </h2>
                <p className="text-xs text-ink-500">Title, reading material, and access tiers</p>
              </div>
            </div>

            <ChapterTitleForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
            <ChapterDescriptionForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
            <LessonSettingsForm initialData={chapter} courseId={params.courseId} chapterId={params.chapterId} />
            <ChapterResourceForm courseId={params.courseId} chapterId={params.chapterId} initialResources={chapter.resources} />

            <div className="pt-2">
              <div className="flex items-center gap-x-2.5 pb-2 border-b border-ink-100 mb-4">
                <IconBadge icon={Eye} variant="ochre" />
                <div>
                  <h3 className="font-serif text-lg font-medium text-ink-950">
                    Preview Permissions
                  </h3>
                  <p className="text-xs text-ink-500">Enable non-enrolled scholars to preview</p>
                </div>
              </div>
              <ChapterAccesssForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-x-2.5 pb-2 border-b border-ink-100">
              <IconBadge icon={Video} variant="ochre" />
              <div>
                <h2 className="font-serif text-xl font-medium text-ink-950">
                  Master Video Recording
                </h2>
                <p className="text-xs text-ink-500">Upload lecture stream and preview playback</p>
              </div>
            </div>
            {["VIDEO", "MIXED"].includes(chapter.lessonType) ? <ChapterVideoForm
              initialData={{ ...chapter, muxPlaybackToken: playbackToken }}
              chapterId={params.chapterId}
              courseId={params.courseId}
            /> : <div className="border border-dashed border-ink-200 rounded-lg p-6 text-sm text-ink-400">This lesson type does not require a video stream.</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
