import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.MANAGE_CONTENT
    );

    const body = await req.json();
    const title = String(body.title || "").trim();
    if (!title) return new NextResponse("Title is required", { status: 400 });
    const lastChapters = await db.chapter.findFirst({
      where: { courseId: params.courseId },
      orderBy: { position: "desc" },
    });

    const newPosition = lastChapters ? lastChapters.position + 1 : 1;
    const chapter = await db.chapter.create({
      data: {
        title,
        courseId: params.courseId,
        lessonType: ["VIDEO", "ARTICLE", "TEXT", "MIXED"].includes(body.lessonType) ? body.lessonType : "VIDEO",
        content: body.content ? String(body.content) : null,
        durationSeconds: body.durationSeconds == null ? null : Math.max(0, Math.round(Number(body.durationSeconds))),
        isRequired: body.isRequired !== false,
        position: newPosition,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("CHAPTERS", error);
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
