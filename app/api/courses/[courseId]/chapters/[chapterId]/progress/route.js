import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { getProgress } from "@/actions/get-progress";
import { progressSchema } from "@/lib/validation";
import { finalizeCourseCompletion } from "@/lib/services/completion";
import { assertRateLimit } from "@/lib/rate-limit";

const saveProgress = async (req, params) => {
  const user = await requireAuth();
  assertRateLimit(req, user.id, { limit: 120, windowMs: 60_000 });
  const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
  const chapter = await db.chapter.findFirst({ where: { id: params.chapterId, courseId: params.courseId, isPublished: true } });
  if (!chapter) return new NextResponse("Lesson not found", { status: 404 });
  if (!chapter.isFree && !hasAccess) return new NextResponse("Forbidden", { status: 403 });
  const parsed = progressSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const existing = await db.userProgress.findUnique({ where: { userId_chapterId: { userId: user.id, chapterId: chapter.id } } });
  const userProgress = await db.userProgress.upsert({
    where: { userId_chapterId: { userId: user.id, chapterId: chapter.id } },
    update: {
      ...(data.isCompleted !== undefined ? { isCompleted: data.isCompleted } : {}),
      ...(data.videoPositionSeconds !== undefined ? { videoPositionSeconds: data.videoPositionSeconds } : {}),
      lastViewedAt: new Date(),
    },
    create: {
      userId: user.id,
      chapterId: chapter.id,
      isCompleted: data.isCompleted ?? false,
      videoPositionSeconds: data.videoPositionSeconds ?? 0,
      lastViewedAt: new Date(),
    },
  });
  const progress = await getProgress(user.id, params.courseId);
  let completion = null;
  if (hasAccess && data.isCompleted !== false) completion = await finalizeCourseCompletion(user.id, params.courseId);
  return NextResponse.json({ userProgress, progress, completion, previousCompleted: existing?.isCompleted || false });
};

export async function PUT(req, { params }) {
  try { return await saveProgress(req, params); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500, headers: error?.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined }); }
}

export async function PATCH(req, { params }) {
  try { return await saveProgress(req, params); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500, headers: error?.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined }); }
}
