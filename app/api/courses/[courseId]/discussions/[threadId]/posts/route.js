import { db } from "@/lib/db";
import { requireAuth, requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

const canStaff = async (courseId) => { try { await requireCoursePermission(courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE); return true; } catch { return false; } };

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    const access = await hasCourseAccess(user.id, params.courseId);
    const staff = await canStaff(params.courseId);
    if (!access.hasAccess && !staff) return new NextResponse("Forbidden", { status: 403 });
    const thread = await db.discussionThread.findFirst({ where: { id: params.threadId, courseId: params.courseId, status: { not: "HIDDEN" } }, select: { id: true, authorId: true, title: true, status: true } });
    if (!thread) return new NextResponse("Discussion not found", { status: 404 });
    if (thread.status === "CLOSED" && !staff) return new NextResponse("Discussion is closed", { status: 409 });
    const content = String((await req.json()).content || "").trim();
    if (!content || content.length > 20000) return new NextResponse("Post content is required and must be under 20,000 characters", { status: 400 });
    const post = await db.discussionPost.create({ data: { threadId: thread.id, authorId: user.id, content } });
    if (thread.authorId !== user.id) {
      await createNotification({ userId: thread.authorId, type: "DISCUSSION_REPLY", title: "New discussion reply", body: `Someone replied to “${thread.title}”.`, link: `/courses/${params.courseId}/discussions/${thread.id}` });
    }
    return NextResponse.json(post, { status: 201 });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
