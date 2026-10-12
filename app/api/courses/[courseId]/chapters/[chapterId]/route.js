import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function DELETE(req, { params }) {
  try {
    await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.MANAGE_CONTENT
    );

    const chapter = await db.chapter.findUnique({
      where: { id: params.chapterId, courseId: params.courseId },
    });

    if (!chapter) return new NextResponse("Not Found", { status: 404 });

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId: params.chapterId },
      });
      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({ where: { id: existingMuxData.id } });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: { id: params.chapterId },
    });

    const publishedChapterInCourse = await db.chapter.findMany({
      where: { courseId: params.courseId, isPublished: true },
    });

    if (!publishedChapterInCourse.length) {
      await db.course.update({
        where: { id: params.courseId },
        data: { isPublished: false },
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.MANAGE_CONTENT
    );

    const values = await req.json();
    const data = {};
    if (values.title !== undefined) data.title = String(values.title).trim();
    if (values.description !== undefined) data.description = values.description ? String(values.description) : null;
    if (values.videoUrl !== undefined) data.videoUrl = values.videoUrl ? String(values.videoUrl) : null;
    if (values.isFree !== undefined) data.isFree = !!values.isFree;
    if (values.lessonType !== undefined) {
      if (!["VIDEO", "ARTICLE", "TEXT", "MIXED"].includes(values.lessonType)) return new NextResponse("Invalid lesson type", { status: 400 });
      data.lessonType = values.lessonType;
    }
    if (values.content !== undefined) data.content = values.content ? String(values.content) : null;
    if (values.durationSeconds !== undefined) {
      const duration = Number(values.durationSeconds);
      if (!Number.isInteger(duration) || duration < 0) return new NextResponse("Invalid duration", { status: 400 });
      data.durationSeconds = duration;
    }
    if (values.isRequired !== undefined) data.isRequired = !!values.isRequired;

    const chapter = await db.chapter.update({
      where: { id: params.chapterId, courseId: params.courseId },
      data,
    });

    if (data.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId: params.chapterId },
      });

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({ where: { id: existingMuxData.id } });
      }

      const asset = await mux.video.assets.create({
        input: data.videoUrl,
        playback_policy: ["signed"],
        encoding_tier: "baseline",
        test: false,
      });

      await db.muxData.create({
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
