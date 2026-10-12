import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  try { await requireAdmin(); return NextResponse.json(await db.certificate.findMany({ include: { course: { select: { id: true, title: true } }, user: { select: { id: true, studentProfile: { select: { displayName: true } } } } }, orderBy: { issuedAt: "desc" }, take: 200 })); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
