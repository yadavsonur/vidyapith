import { db } from "@/lib/db";
import { requireCoursePermission, COURSE_PERMISSIONS } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function DELETE(req, { params }) { try { await requireCoursePermission(params.courseId, COURSE_PERMISSIONS.EDIT_COURSE); const result = await db.coursePrerequisite.deleteMany({ where: { courseId: params.courseId, prerequisiteId: params.prerequisiteId } }); if (!result.count) return new NextResponse("Prerequisite not found", { status: 404 }); return new NextResponse(null, { status: 204 }); } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); } }
