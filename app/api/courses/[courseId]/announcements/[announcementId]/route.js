import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";
import { notifyCourseStudents } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_ANNOUNCEMENTS);
    const existing = await db.courseAnnouncement.findFirst({
      where: { id: params.announcementId, courseId: params.courseId },
    });
    if (!existing) return new NextResponse("Announcement not found", { status: 404 });
    const body = await req.json();
    const publish = body.isPublished === undefined ? existing.isPublished : !!body.isPublished;
    const announcement = await db.courseAnnouncement.update({
      where: { id: existing.id },
      data: {
        ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
        ...(body.content !== undefined ? { content: String(body.content).trim() } : {}),
        isPublished: publish,
        publishedAt: publish ? existing.publishedAt || new Date() : null,
      },
    });
    if (publish && !existing.isPublished) await notifyCourseStudents({ courseId: params.courseId, type: "ANNOUNCEMENT", title: announcement.title, body: announcement.content, link: `/courses/${params.courseId}`, eventKey: `announcement:${announcement.id}` });
    const auth = await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_ANNOUNCEMENTS);
    await writeAuditLog({ actorId: auth.user.id, action: publish && !existing.isPublished ? "ANNOUNCEMENT_PUBLISHED" : "ANNOUNCEMENT_UPDATED", entityType: "CourseAnnouncement", entityId: announcement.id });
    return NextResponse.json(announcement);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_ANNOUNCEMENTS);
    const existing = await db.courseAnnouncement.findFirst({
      where: { id: params.announcementId, courseId: params.courseId },
    });
    if (!existing) return new NextResponse("Announcement not found", { status: 404 });
    await db.courseAnnouncement.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
