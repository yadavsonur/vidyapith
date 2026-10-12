import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await requireAdmin();
    const url = new URL(req.url); const status = url.searchParams.get("status");
    const reviews = await db.courseReview.findMany({ where: status ? { status } : {}, include: { course: { select: { id: true, title: true } }, user: { select: { id: true, studentProfile: { select: { displayName: true } } } } }, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json(reviews);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
