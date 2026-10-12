import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET });

export async function DELETE(req, { params }) {
  try {
    const { user, course } = await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.DELETE_COURSE);
    if (user.role !== "ADMIN" && course.userId !== user.id) return new NextResponse("Forbidden", { status: 403 });

    const fullCourse = await db.course.findUnique({ where: { id: params.courseId }, include: { chapters: { include: { muxData: true } } } });
    if (!fullCourse) return new NextResponse("Not found", { status: 404 });
    for (const chapter of fullCourse.chapters) if (chapter.muxData?.assetId) await mux.video.assets.delete(chapter.muxData.assetId).catch(() => {});
    const deletedCourse = await db.course.delete({ where: { id: params.courseId } });
    await writeAuditLog({ actorId: user.id, action: "COURSE_DELETED", entityType: "Course", entityId: deletedCourse.id, metadata: { title: fullCourse.title } });
    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.EDIT_COURSE);
    const values = await req.json();
    const data = {};
    if (values.title !== undefined) data.title = String(values.title).trim();
    if (values.description !== undefined) data.description = values.description ? String(values.description) : null;
    if (values.imageUrl !== undefined) data.imageUrl = values.imageUrl ? String(values.imageUrl) : null;
    if (values.price !== undefined) {
      const price = Number(values.price);
      if (!Number.isFinite(price) || price < 0) return new NextResponse("Invalid price", { status: 400 });
      data.price = price;
    }
    if (values.categoryId !== undefined) data.categoryId = values.categoryId || null;
    const course = await db.course.update({ where: { id: params.courseId }, data });
    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
