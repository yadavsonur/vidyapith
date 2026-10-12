import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await requireAdmin();
    const name = String((await req.json()).name || "").trim();
    if (!name || name.length > 120) return new NextResponse("Category name is required", { status: 400 });
    return NextResponse.json(await db.category.update({ where: { id: params.categoryId }, data: { name } }));
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    await requireAdmin();
    const count = await db.course.count({ where: { categoryId: params.categoryId } });
    if (count) return new NextResponse("Reassign courses before deleting this category", { status: 409 });
    await db.category.delete({ where: { id: params.categoryId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
