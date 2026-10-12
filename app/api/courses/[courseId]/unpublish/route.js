import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const { user } = await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.PUBLISH_COURSE);
    const course = await db.course.update({ where: { id: params.courseId }, data: { isPublished: false, status: "DRAFT", publishedAt: null } });
    await writeAuditLog({ actorId: user.id, action: "COURSE_UNPUBLISHED", entityType: "Course", entityId: course.id });
    return NextResponse.json(course);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
