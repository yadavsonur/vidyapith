import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/course-access";
import { finalizeCourseCompletion } from "@/lib/services/completion";
import { assertRateLimit } from "@/lib/rate-limit";

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    assertRateLimit(req, user.id, { limit: 20, windowMs: 60_000 });
    const { hasAccess } = await hasCourseAccess(user.id, params.courseId);
    if (!hasAccess) return new NextResponse("Forbidden", { status: 403 });
    const result = await finalizeCourseCompletion(user.id, params.courseId);
    if (!result.completed) return NextResponse.json(result, { status: 409 });
    return NextResponse.json(result);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
