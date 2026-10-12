import { db } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireTeacher();
    const profile = await db.instructorProfile.findUnique({ where: { userId: user.id } });
    return NextResponse.json(profile || { userId: user.id, displayName: "", headline: "", bio: "", expertise: "", website: "" });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await requireTeacher();
    const body = await req.json();
    const data = {
      displayName: body.displayName?.trim() || null,
      headline: body.headline?.trim() || null,
      bio: body.bio?.trim() || null,
      expertise: body.expertise?.trim() || null,
      website: body.website?.trim() || null,
    };
    if (data.bio && data.bio.length > 5000) return new NextResponse("Bio is too long", { status: 400 });
    if (data.website && !/^https?:\/\//i.test(data.website)) return new NextResponse("Website must start with http:// or https://", { status: 400 });
    const profile = await db.instructorProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });
    return NextResponse.json(profile);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
