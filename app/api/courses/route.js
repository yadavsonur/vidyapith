import { db } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const user = await requireTeacher();
    const { title } = await req.json();

    const course = await db.course.create({
      data: {
        userId: user.id,
        title,
        instructors: {
          create: {
            user: { connect: { id: user.id } },
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES]", error);
    const status = error?.status || 500;
    return new NextResponse(error?.message || "Internal Error", { status });
  }
}
