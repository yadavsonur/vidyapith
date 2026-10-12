import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const user = await requireAuth();
    const certificate = await db.certificate.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
      include: { course: { select: { id: true, title: true, userId: true } } },
    });
    if (!certificate || certificate.revokedAt) return new NextResponse("Certificate not found", { status: 404 });
    return NextResponse.json(certificate);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
