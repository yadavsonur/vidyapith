import { db } from "@/lib/db";
import { ensureEnrollment } from "@/lib/course-access";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    const course = await db.course.findUnique({ where: { id: params.courseId, isPublished: true }, include: { prerequisites: { select: { prerequisiteId: true, prerequisite: { select: { id: true, title: true } } } } } });
    if (!course) return new NextResponse("Course not found", { status: 404 });
    if (Number(course.price || 0) > 0) return new NextResponse("Paid courses must be purchased through checkout", { status: 400 });
    if (course.prerequisites.length) {
      const completed = await db.enrollment.findMany({ where: { userId: user.id, courseId: { in: course.prerequisites.map(p => p.prerequisiteId) }, status: "COMPLETED" }, select: { courseId: true } });
      const done = new Set(completed.map(x => x.courseId));
      const unmet = course.prerequisites.filter(p => !done.has(p.prerequisiteId));
      if (unmet.length) return NextResponse.json({ error: "Prerequisite courses must be completed first", prerequisites: unmet.map(p => p.prerequisite) }, { status: 409 });
    }
    const enrollment = await ensureEnrollment(user.id, course.id);
    await writeAuditLog({ actorId: user.id, action: "ENROLLMENT_CREATED", entityType: "Enrollment", entityId: enrollment.id, metadata: { courseId: course.id } });
    await createNotification({ userId: user.id, type: "SYSTEM", title: "Enrollment confirmed", body: `You are now enrolled in “${course.title}”.`, link: `/courses/${course.id}`, dedupeKey: `enrollment:${enrollment.id}` });
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
