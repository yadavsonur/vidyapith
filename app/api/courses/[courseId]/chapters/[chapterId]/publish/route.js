import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.PUBLISH_COURSE);

    const chapter = await db.chapter.findUnique({
      where: { id: params.chapterId, courseId: params.courseId },
      include: { muxData: true },
    });
    if (!chapter) return new NextResponse("Not Found", { status: 404 });

    const needsVideo = ["VIDEO", "MIXED"].includes(chapter.lessonType);
    const needsContent = ["ARTICLE", "TEXT", "MIXED"].includes(chapter.lessonType);
    const contentReady = !!(chapter.content || chapter.description);

    if (!chapter.title || (needsVideo && (!chapter.videoUrl || !chapter.muxData?.playbackId)) || (needsContent && !contentReady)) {
      return new NextResponse("Missing required lesson fields", { status: 400 });
    }

    const publishedChapter = await db.chapter.update({
      where: { id: params.chapterId, courseId: params.courseId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedChapter);
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
