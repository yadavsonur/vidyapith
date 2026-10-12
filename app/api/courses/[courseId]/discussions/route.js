import { db } from "@/lib/db";
import { requireAuth, requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { discussionSchema } from "@/lib/validation";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

const canStaff = async (courseId) => {
  try { await requireCoursePermission(courseId, COURSE_PERMISSIONS.VIEW_TEACHER_COURSE); return true; } catch { return false; }
};

export async function GET(req, { params }) {
  try {
    const user = await requireAuth();
    const access = await hasCourseAccess(user.id, params.courseId);
    const staff = await canStaff(params.courseId);
    if (!access.hasAccess && !staff) return new NextResponse("Forbidden", { status: 403 });
    const threads = await db.discussionThread.findMany({
      where: { courseId: params.courseId, ...(staff ? {} : { status: { not: "HIDDEN" } }) },
      include: { author: { select: { id: true, role: true, studentProfile: { select: { displayName: true } }, profile: { select: { displayName: true } } } }, chapter: { select: { id: true, title: true } }, _count: { select: { posts: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return NextResponse.json(threads);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    const access = await hasCourseAccess(user.id, params.courseId);
    const staff = await canStaff(params.courseId);
    if (!access.hasAccess && !staff) return new NextResponse("Forbidden", { status: 403 });
    const parsed = discussionSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    if (data.chapterId) {
      const chapter = await db.chapter.findFirst({ where: { id: data.chapterId, courseId: params.courseId, isPublished: true }, select: { id: true } });
      if (!chapter) return new NextResponse("Lesson not found", { status: 404 });
    }
    const thread = await db.discussionThread.create({ data: { courseId: params.courseId, chapterId: data.chapterId || null, authorId: user.id, title: data.title, content: data.content } });
    return NextResponse.json(thread, { status: 201 });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
