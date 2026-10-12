import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const existing = await db.chapterResource.findFirst({ where: { id: params.resourceId, chapter: { courseId: params.courseId } } });
    if (!existing) return new NextResponse("Resource not found", { status: 404 });
    const body = await req.json();
    const data = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.url !== undefined) data.url = String(body.url).trim();
    if (body.mimeType !== undefined) data.mimeType = body.mimeType ? String(body.mimeType).trim() : null;
    if (body.isPublished !== undefined) data.isPublished = !!body.isPublished;
    const resource = await db.chapterResource.update({ where: { id: existing.id }, data });
    return NextResponse.json(resource);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const result = await db.chapterResource.deleteMany({ where: { id: params.resourceId, chapter: { courseId: params.courseId } } });
    if (!result.count) return new NextResponse("Resource not found", { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
