import { db } from "@/lib/db";
import { requireAuth, requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { NextResponse } from "next/server";

const staffAccess = async (courseId) => { try { await requireCoursePermission(courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE); return true; } catch { return false; } };

export async function GET(req, { params }) {
  try {
    const user = await requireAuth();
    const access = await hasCourseAccess(user.id, params.courseId);
    const staff = await staffAccess(params.courseId);
    if (!access.hasAccess && !staff) return new NextResponse("Forbidden", { status: 403 });
    const thread = await db.discussionThread.findFirst({ where: { id: params.threadId, courseId: params.courseId }, include: { author: { select: { id: true, role: true, studentProfile: { select: { displayName: true } }, profile: { select: { displayName: true } } } }, chapter: { select: { id: true, title: true } }, posts: { include: { author: { select: { id: true, role: true, studentProfile: { select: { displayName: true } }, profile: { select: { displayName: true } } } } }, orderBy: { createdAt: "asc" } } } });
    if (!thread || (!staff && thread.status === "HIDDEN")) return new NextResponse("Discussion not found", { status: 404 });
    return NextResponse.json(thread);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function PATCH(req, { params }) {
  try {
    const user = await requireAuth();
    const thread = await db.discussionThread.findFirst({ where: { id: params.threadId, courseId: params.courseId } });
    if (!thread) return new NextResponse("Discussion not found", { status: 404 });
    const staff = await staffAccess(params.courseId);
    if (thread.authorId !== user.id && !staff) return new NextResponse("Forbidden", { status: 403 });
    const body = await req.json();
    const data = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.content !== undefined) data.content = String(body.content).trim();
    if (staff && body.status !== undefined && ["OPEN", "CLOSED", "HIDDEN"].includes(body.status)) data.status = body.status;
    const updated = await db.discussionThread.update({ where: { id: thread.id }, data });
    return NextResponse.json(updated);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    const user = await requireAuth();
    const thread = await db.discussionThread.findFirst({ where: { id: params.threadId, courseId: params.courseId } });
    if (!thread) return new NextResponse("Discussion not found", { status: 404 });
    const staff = await staffAccess(params.courseId);
    if (thread.authorId !== user.id && !staff) return new NextResponse("Forbidden", { status: 403 });
    await db.discussionThread.delete({ where: { id: thread.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
