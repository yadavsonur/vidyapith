import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  try { await requireAdmin(); return NextResponse.json(await db.discussionThread.findMany({ include: { course: { select: { id: true, title: true } }, author: { select: { id: true, role: true } }, _count: { select: { posts: true } } }, orderBy: { updatedAt: "desc" }, take: 200 })); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
