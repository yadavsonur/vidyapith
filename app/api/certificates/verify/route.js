import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const number = new URL(req.url).searchParams.get("number")?.trim();
    if (!number) return new NextResponse("Certificate number is required", { status: 400 });
    const certificate = await db.certificate.findUnique({
      where: { certificateNumber: number },
      select: { id: true, certificateNumber: true, issuedAt: true, revokedAt: true, user: { select: { studentProfile: { select: { displayName: true } }, profile: { select: { displayName: true } } } }, course: { select: { id: true, title: true } } },
    });
    if (!certificate || certificate.revokedAt) return NextResponse.json({ valid: false }, { status: 404 });
    const studentName = certificate.user.studentProfile?.displayName || certificate.user.profile?.displayName || "Learner";
    return NextResponse.json({ valid: true, certificate: { id: certificate.id, certificateNumber: certificate.certificateNumber, issuedAt: certificate.issuedAt, studentName, course: certificate.course } });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}
