import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.MANAGE_CONTENT
    );

    const { url } = await req.json();
    const fileName = url.split("/").pop() || "default_filename";

    const attachment = await db.attachement.create({
      data: {
        url,
        name: fileName,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
