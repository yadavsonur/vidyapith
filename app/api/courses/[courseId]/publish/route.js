import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyCourseStudents, createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const { user, course } = await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.PUBLISH_COURSE);
    const full = await db.course.findUnique({ where: { id: course.id }, include: { chapters: { where: { isPublished: true } } } });
    if (!full) return new NextResponse("Not found", { status: 404 });
    if (!full.title || !full.description || !full.imageUrl || !full.categoryId || !full.chapters.length) return new NextResponse("Missing required fields", { status: 400 });
    if (full.isPublished && full.status === "PUBLISHED") return NextResponse.json(full);
    if (user.role !== "ADMIN") {
      return new NextResponse("Only an administrator can publish a course. Submit the course for review instead.", { status: 403 });
    }
    const publishedCourse = await db.course.update({ where: { id: full.id }, data: { isPublished: true, status: "PUBLISHED", publishedAt: full.publishedAt || new Date(), reviewNote: null } });
    await writeAuditLog({ actorId: user.id, action: "COURSE_PUBLISHED", entityType: "Course", entityId: full.id });
    if (full.status === "PENDING_REVIEW" && full.userId !== user.id) {
      await createNotification({ userId: full.userId, type: "COURSE_APPROVED", title: "Course approved", body: `“${full.title}” is now published.`, link: `/teacher/courses/${full.id}`, dedupeKey: `course-approved:${full.id}:${publishedCourse.publishedAt.toISOString()}` });
    }
    await notifyCourseStudents({ courseId: full.id, type: "SYSTEM", title: "Course updated", body: `“${full.title}” has been updated by the teaching team.`, link: `/courses/${full.id}`, eventKey: `course-published:${full.id}:${publishedCourse.publishedAt.toISOString()}` }).catch(() => {});
    return NextResponse.json(publishedCourse);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
