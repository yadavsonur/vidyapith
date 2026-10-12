import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const { user, course } = await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.PUBLISH_COURSE);
    const full = await db.course.findUnique({ where: { id: course.id }, include: { chapters: { where: { isPublished: true } } } });
    if (!full?.title || !full?.description || !full?.imageUrl || !full?.categoryId || !full.chapters.length) return new NextResponse("Course is missing required publishing fields", { status: 400 });
    const updated = await db.course.update({ where: { id: course.id }, data: { status: "PENDING_REVIEW", isPublished: false } });
    await writeAuditLog({ actorId: user.id, action: "COURSE_SUBMITTED_FOR_REVIEW", entityType: "Course", entityId: course.id });
    return NextResponse.json(updated);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
