import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

export async function PATCH(req, { params }) {
  try {
    const admin = await requireAdmin(); const body = await req.json();
    if (!["APPROVED", "HIDDEN", "PENDING"].includes(body.status)) return new NextResponse("Invalid moderation status", { status: 400 });
    const review = await db.courseReview.update({ where: { id: params.reviewId }, data: { status: body.status, moderatedBy: admin.id, moderatedAt: new Date() } });
    await writeAuditLog({ actorId: admin.id, action: "REVIEW_MODERATED", entityType: "CourseReview", entityId: review.id, metadata: { status: body.status } });
    await createNotification({ userId: review.userId, type: "REVIEW_MODERATED", title: "Review moderation updated", body: `Your course review is now ${body.status.toLowerCase()}.`, link: `/courses/${review.courseId}` });
    return NextResponse.json(review);
  } catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function DELETE(req, { params }) {
  try { const admin = await requireAdmin(); await db.courseReview.delete({ where: { id: params.reviewId } }); await writeAuditLog({ actorId: admin.id, action: "REVIEW_DELETED", entityType: "CourseReview", entityId: params.reviewId }); return new NextResponse(null, { status: 204 }); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
