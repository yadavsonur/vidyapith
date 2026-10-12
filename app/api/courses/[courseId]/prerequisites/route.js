import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try { await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE); return NextResponse.json(await db.coursePrerequisite.findMany({ where: { courseId: params.courseId }, include: { prerequisite: { select: { id: true, title: true, status: true } } } })); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function POST(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.EDIT_COURSE);
    const prerequisiteId = String((await req.json()).prerequisiteId || "").trim();
    if (!prerequisiteId || prerequisiteId === params.courseId) return new NextResponse("A course cannot be its own prerequisite", { status: 400 });
    const target = await db.course.findUnique({ where: { id: prerequisiteId }, select: { id: true, title: true } });
    if (!target) return new NextResponse("Prerequisite course not found", { status: 404 });
    const edges = await db.coursePrerequisite.findMany({
      select: { courseId: true, prerequisiteId: true },
    });
    const prerequisitesByCourse = new Map();
    for (const edge of edges) {
      const next = prerequisitesByCourse.get(edge.courseId) || [];
      next.push(edge.prerequisiteId);
      prerequisitesByCourse.set(edge.courseId, next);
    }

    const stack = [prerequisiteId];
    const visited = new Set();
    while (stack.length) {
      const current = stack.pop();
      if (current === params.courseId) return new NextResponse("Circular prerequisite detected", { status: 409 });
      if (visited.has(current)) continue;
      visited.add(current);
      for (const nextId of prerequisitesByCourse.get(current) || []) stack.push(nextId);
    }

    const relation = await db.coursePrerequisite.create({ data: { courseId: params.courseId, prerequisiteId } });
    return NextResponse.json(relation, { status: 201 });
  } catch (error) { return new NextResponse(error?.code === "P2002" ? "Prerequisite already exists" : error?.message || "Internal Error", { status: error?.code === "P2002" ? 409 : error?.status || 500 }); }
}
