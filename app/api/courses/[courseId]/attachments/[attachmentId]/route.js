import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await requireCoursePermission(
      params.courseId,
      COURSE_PERMISSIONS.MANAGE_CONTENT
    );

    const attachment = await db.attachement.findUnique({
      where: { id: params.attachmentId },
    });

    if (!attachment || attachment.courseId !== params.courseId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const deletedAttachment = await db.attachement.delete({
      where: { id: params.attachmentId },
    });

    return NextResponse.json(deletedAttachment);
  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
