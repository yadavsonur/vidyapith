import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const admin = await requireAdmin();
    const course = await db.course.findUnique({
      where: { id: params.courseId },
      include: { chapters: { where: { isPublished: true }, select: { id: true, lessonType: true, content: true, muxData: { select: { playbackId: true } } } } },
    });
    if (!course) return new NextResponse("Course not found", { status: 404 });
    const body = await req.json();
    const allowed = ["PUBLISHED", "REJECTED", "ARCHIVED", "DRAFT", "PENDING_REVIEW"];
    if (!allowed.includes(body.status)) return new NextResponse("Invalid course status", { status: 400 });
    const isPublished = body.status === "PUBLISHED";
    if (isPublished) {
      const invalidChapter = course.chapters.find((chapter) => {
        const hasWrittenContent = ["ARTICLE", "TEXT", "MIXED"].includes(chapter.lessonType) && String(chapter.content || "").trim().length > 0;
        const hasVideo = ["VIDEO", "MIXED"].includes(chapter.lessonType) && Boolean(chapter.muxData?.playbackId);
        return !hasWrittenContent && !hasVideo;
      });
      if (!course.title?.trim() || !course.description?.trim() || !course.imageUrl || !course.categoryId || course.price === null || course.price === undefined || course.chapters.length === 0 || invalidChapter) {
        return new NextResponse("Course is missing required publishing fields or has an invalid published lesson", { status: 400 });
      }
    }
    const updated = await db.course.update({ where: { id: course.id }, data: { status: body.status, isPublished, publishedAt: isPublished ? new Date() : null, reviewNote: body.reviewNote ? String(body.reviewNote).trim() : null } });
    await writeAuditLog({ actorId: admin.id, action: `COURSE_${body.status}`, entityType: "Course", entityId: course.id, metadata: { reviewNote: body.reviewNote || null } });
    if (body.status === "PUBLISHED" || body.status === "REJECTED") {
      await createNotification({ userId: course.userId, type: body.status === "PUBLISHED" ? "COURSE_APPROVED" : "COURSE_REJECTED", title: body.status === "PUBLISHED" ? "Course approved" : "Course review decision", body: body.status === "PUBLISHED" ? `“${course.title}” has been approved and published.` : `“${course.title}” was rejected. ${body.reviewNote || "See the course review notes."}`, link: `/teacher/courses/${course.id}`, dedupeKey: `course-status:${course.id}:${body.status}:${updated.updateAt.toISOString()}` });
    }
    return NextResponse.json(updated);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
