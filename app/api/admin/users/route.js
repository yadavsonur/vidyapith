import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();
    const users = await db.user.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
