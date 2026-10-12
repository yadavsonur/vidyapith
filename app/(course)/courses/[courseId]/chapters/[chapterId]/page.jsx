import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { Preview } from "@/components/preview";
import { FileText, ArrowLeft, Download } from "lucide-react";
import { CourseProgressButton } from "./_components/course-progress-button";
import Link from "next/link";
import { LearningTools } from "./_components/learning-tools";
import { isMuxSigningConfigured, signMuxPlaybackToken } from "@/lib/mux";
import { db } from "@/lib/db";

const ChapterIdPage = async ({ params }) => {
  const { userId } = auth();
  const {
    chapter,
    course,
    muxData,
    attachments,
    resources,
    nextChapter,
    userProgress,
    hasAccess,
    isLocked,
    enrollment,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) return redirect("/");
  const completeOnEnd = hasAccess && !userProgress?.isCompleted;
  const playbackToken = muxData?.playbackId && !isLocked && isMuxSigningConfigured() ? signMuxPlaybackToken(muxData.playbackId) : null;
  const isBookmarked = userProgress ? await (async () => { try { return !!(await db.bookmark.findUnique({ where: { userId_chapterId: { userId: userId || "", chapterId: chapter.id } } })); } catch { return false; } })() : false;

  return (
    <div className="min-h-full">
      {userProgress?.isCompleted && (
        <Banner
          variant="success"
          label="Scholarship milestone: You have completed this lecture chapter."
        />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="This chapter is locked. Enroll in the curriculum to unlock full streaming access."
        />
      )}

      <div className="flex flex-col max-w-5xl mx-auto p-6 md:p-10 pb-28 space-y-8">
        {/* Top Back Context */}
        <div className="flex items-center justify-between">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex items-center text-xs font-mono text-ink-500 hover:text-ink-950 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Curriculum Overview
          </Link>
          <span className="text-xs font-mono text-ink-400">
            {course.title}
          </span>
        </div>

        {/* Video Player Theater */}
        <div className="w-full">
{["VIDEO", "MIXED"].includes(chapter.lessonType) && <VideoPlayer
            chapterId={params.chapterId}
            title={chapter.title}
            courseId={params.courseId}
            nextChapterId={nextChapter?.id}
            playbackId={muxData?.playbackId}
            playbackToken={playbackToken}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
            initialPosition={Number(userProgress?.videoPositionSeconds || 0)}
          />}
          {["ARTICLE", "TEXT", "MIXED"].includes(chapter.lessonType) && !isLocked && <div className="border border-ink-200 rounded-xl bg-white p-6 font-sans text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">{chapter.content || chapter.description || "No written lesson content."}</div>}
        </div>

        {userId && hasAccess && <LearningTools courseId={params.courseId} chapterId={params.chapterId} bookmarked={isBookmarked} />}


        {!!resources.length && (
          <div className="rounded-xl border border-ink-200/90 bg-white shadow-subtle p-5 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-500">Lesson Resources</div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {resources.map((resource) => (
                <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-ink-200 p-3 hover:border-ink-400 hover:bg-parchment-50">
                  <span className="text-sm font-medium text-ink-800 truncate">{resource.name}</span>
                  <Download className="h-4 w-4 text-ink-400 shrink-0 ml-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action & Title Bar */}
        <div className="border border-ink-200/90 rounded-xl p-6 bg-white shadow-subtle space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink-100">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold mb-1">
                Active Lecture
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-medium text-ink-950">
                {chapter.title}
              </h1>
            </div>

            <div className="shrink-0">
              {hasAccess ? (
                <CourseProgressButton
                  chapterId={params.chapterId}
                  courseId={params.courseId}
                  nextChapterId={nextChapter?.id}
                  isCompleted={!!userProgress?.isCompleted}
                />
              ) : (
                <CourseEnrollButton
                  courseId={params.courseId}
                  price={course.price}
                  enrolled={!!enrollment}
                />
              )}
            </div>
          </div>

          {/* Reading Material & Description */}
          <div className={isLocked ? "opacity-50 pointer-events-none select-none" : ""}>
            <div className="text-xs font-mono uppercase tracking-wider text-ink-400 mb-2">
              Syllabus Reading & Commentary
            </div>
            {chapter.description ? (
              <div className="font-sans text-sm text-ink-800 leading-relaxed">
                <Preview value={chapter.description} />
              </div>
            ) : (
              <p className="text-xs text-ink-400 font-mono italic">
                No supplementary written lecture text for this chapter.
              </p>
            )}
          </div>

          {/* Downloadable Assets */}
          {!!attachments.length && (
            <div className="pt-4 border-t border-ink-100 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-ink-500">
                Supplementary Downloads & Treatises ({attachments.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    key={attachment.id}
                    className="flex items-center justify-between p-3 rounded-md bg-parchment-50 border border-ink-200/90 hover:border-ink-400 hover:bg-parchment-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-ink-500 shrink-0 group-hover:text-ink-800" />
                      <span className="text-xs text-ink-800 font-medium truncate font-sans">
                        {attachment.name}
                      </span>
                    </div>
                    <Download className="h-3.5 w-3.5 text-ink-400 shrink-0 group-hover:text-ink-800" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
