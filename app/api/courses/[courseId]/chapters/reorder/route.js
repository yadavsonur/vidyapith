import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.MANAGE_CONTENT
    );

    const { list } = await req.json();
    for (const item of list) {
      await db.chapter.update({
        where: { id: item.id, courseId: params.courseId },
        data: { position: item.position },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
