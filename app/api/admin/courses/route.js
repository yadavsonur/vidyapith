import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 25)));
    const status = url.searchParams.get("status");
    const [items, total] = await Promise.all([
      db.course.findMany({ where: status ? { status } : {}, include: { category: true, _count: { select: { enrollments: true, reviews: true, chapters: true } } }, orderBy: { updateAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      db.course.count({ where: status ? { status } : {} }),
    ]);
    return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total / pageSize) });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
