import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await db.studentProfile.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ user: { id: user.id, role: user.role }, profile: profile || { displayName: "", bio: "", avatarUrl: "", website: "" } });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = {
      displayName: body.displayName?.trim() || null,
      bio: body.bio?.trim() || null,
      avatarUrl: body.avatarUrl?.trim() || null,
      website: body.website?.trim() || null,
    };
    if (data.displayName && data.displayName.length > 120) return new NextResponse("Display name is too long", { status: 400 });
    if (data.bio && data.bio.length > 5000) return new NextResponse("Bio is too long", { status: 400 });
    if (data.website && !/^https?:\/\//i.test(data.website)) return new NextResponse("Website must start with http:// or https://", { status: 400 });
    const profile = await db.studentProfile.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });
    return NextResponse.json(profile);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
