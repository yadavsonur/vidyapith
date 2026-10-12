import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const user = await requireAuth();
    const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
    if (!hasAccess) return new NextResponse("Forbidden", { status: 403 });
    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id, courseId: params.courseId },
      include: { chapter: { select: { id: true, title: true, position: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookmarks);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
    if (!hasAccess) return new NextResponse("Forbidden", { status: 403 });
    const { chapterId } = await req.json();
    const chapter = await db.chapter.findFirst({ where: { id: chapterId, courseId: params.courseId, isPublished: true }, select: { id: true } });
    if (!chapter) return new NextResponse("Lesson not found", { status: 404 });
    const bookmark = await db.bookmark.upsert({
      where: { userId_chapterId: { userId: user.id, chapterId } },
      update: {},
      create: { userId: user.id, courseId: params.courseId, chapterId },
    });
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await requireAuth();
    const chapterId = new URL(req.url).searchParams.get("chapterId");
    const result = await db.bookmark.deleteMany({ where: { userId: user.id, courseId: params.courseId, chapterId: chapterId || "" } });
    if (!result.count) return new NextResponse("Bookmark not found", { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
