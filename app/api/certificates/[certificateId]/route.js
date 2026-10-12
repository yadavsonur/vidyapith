import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const certificate = await db.certificate.findUnique({
      where: { id: params.certificateId },
      select: { id: true, certificateNumber: true, issuedAt: true, revokedAt: true, course: { select: { id: true, title: true } }, user: { select: { id: true, studentProfile: { select: { displayName: true } }, profile: { select: { displayName: true } } } } },
    });
    if (!certificate || certificate.revokedAt) return new NextResponse("Certificate not found", { status: 404 });
    const studentName = certificate.user.studentProfile?.displayName || certificate.user.profile?.displayName || "Learner";
    return NextResponse.json({ ...certificate, user: undefined, studentName, verifyUrl: `/certificates/${certificate.id}` });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}
