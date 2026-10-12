import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { noteSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const user = await requireAuth();
    const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
    if (!hasAccess) return new NextResponse("Forbidden", { status: 403 });
    const notes = await db.note.findMany({
      where: { userId: user.id, courseId: params.courseId },
      include: { chapter: { select: { id: true, title: true, position: true } } },
      orderBy: [{ chapter: { position: "asc" } }, { createdAt: "desc" }],
    });
    return NextResponse.json(notes);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
    if (!hasAccess) return new NextResponse("Forbidden", { status: 403 });
    const parsed = noteSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    const chapter = await db.chapter.findFirst({ where: { id: data.chapterId, courseId: params.courseId, isPublished: true }, select: { id: true } });
    if (!chapter) return new NextResponse("Lesson not found", { status: 404 });
    const note = await db.note.create({ data: { userId: user.id, courseId: params.courseId, ...data } });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await requireAuth();
    const { noteId, content, timestampSeconds } = await req.json();
    const existing = await db.note.findFirst({ where: { id: noteId, userId: user.id, courseId: params.courseId } });
    if (!existing) return new NextResponse("Note not found", { status: 404 });
    const parsed = noteSchema.partial().safeParse({ chapterId: existing.chapterId, content, timestampSeconds });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const note = await db.note.update({ where: { id: existing.id }, data: { content: parsed.data.content, timestampSeconds: parsed.data.timestampSeconds ?? null } });
    return NextResponse.json(note);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await requireAuth();
    const noteId = new URL(req.url).searchParams.get("noteId");
    const result = await db.note.deleteMany({ where: { id: noteId || "", userId: user.id, courseId: params.courseId } });
    if (!result.count) return new NextResponse("Note not found", { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
