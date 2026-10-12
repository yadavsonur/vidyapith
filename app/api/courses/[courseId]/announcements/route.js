import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";
import { notifyCourseStudents } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req, { params }) {
  try {
    const { user } = await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.VIEW_TEACHER_COURSE
    );
    const includeUnpublished = user.role === "ADMIN" || user.role === "TEACHER";
    const announcements = await db.courseAnnouncement.findMany({
      where: {
        courseId: params.courseId,
        ...(includeUnpublished ? {} : { isPublished: true }),
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(announcements);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { user } = await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_ANNOUNCEMENTS);
    const body = await req.json();
    if (!body.title?.trim() || !body.content?.trim()) {
      return new NextResponse("Title and content are required", { status: 400 });
    }
    const publish = !!body.isPublished;
    const announcement = await db.courseAnnouncement.create({
      data: {
        courseId: params.courseId,
        authorId: user.id,
        title: body.title.trim(),
        content: body.content.trim(),
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });
    await writeAuditLog({ actorId: user.id, action: publish ? "ANNOUNCEMENT_PUBLISHED" : "ANNOUNCEMENT_CREATED", entityType: "CourseAnnouncement", entityId: announcement.id });
    if (publish) await notifyCourseStudents({ courseId: params.courseId, type: "ANNOUNCEMENT", title: announcement.title, body: announcement.content, link: `/courses/${params.courseId}`, eventKey: `announcement:${announcement.id}` });
    return NextResponse.json(announcement);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
