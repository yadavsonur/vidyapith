import { db } from "@/lib/db";
import { requireAuth, requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const user = await requireAuth();
    const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
    const canManage = user.role === "ADMIN" || user.role === "TEACHER" ? await (async () => { try { await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE); return true; } catch { return false; } })() : false;
    if (!hasAccess && !canManage) return new NextResponse("Forbidden", { status: 403 });
    const chapterId = new URL(req.url).searchParams.get("chapterId");
    const resources = await db.chapterResource.findMany({ where: { chapterId: chapterId || undefined, chapter: { courseId: params.courseId }, ...(canManage ? {} : { isPublished: true }) }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(resources);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.MANAGE_CONTENT);
    const body = await req.json();
    if (!body.chapterId || !body.name?.trim() || !body.url?.trim()) return new NextResponse("chapterId, name and url are required", { status: 400 });
    const chapter = await db.chapter.findFirst({ where: { id: body.chapterId, courseId: params.courseId } });
    if (!chapter) return new NextResponse("Lesson not found", { status: 404 });
    const resource = await db.chapterResource.create({ data: { chapterId: chapter.id, name: body.name.trim(), url: body.url.trim(), mimeType: body.mimeType?.trim() || null, sizeBytes: body.sizeBytes ? Math.max(0, Math.round(Number(body.sizeBytes))) : null, isPublished: body.isPublished !== false } });
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
