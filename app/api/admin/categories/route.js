import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try { await requireAdmin(); return NextResponse.json(await db.category.findMany({ include: { _count: { select: { courses: true } } }, orderBy: { name: "asc" } })); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function POST(req) {
  try {
    await requireAdmin();
    const name = String((await req.json()).name || "").trim();
    if (!name || name.length > 120) return new NextResponse("Category name is required", { status: 400 });
    const category = await db.category.create({ data: { name } });
    return NextResponse.json(category, { status: 201 });
  } catch (error) { return new NextResponse(error?.code === "P2002" ? "Category already exists" : error?.message || "Internal Error", { status: error?.code === "P2002" ? 409 : error?.status || 500 }); }
}
