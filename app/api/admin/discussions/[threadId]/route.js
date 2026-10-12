import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try { const admin = await requireAdmin(); const status = (await req.json()).status; if (!["OPEN", "CLOSED", "HIDDEN"].includes(status)) return new NextResponse("Invalid status", { status: 400 }); const thread = await db.discussionThread.update({ where: { id: params.threadId }, data: { status } }); await writeAuditLog({ actorId: admin.id, action: "DISCUSSION_MODERATED", entityType: "DiscussionThread", entityId: thread.id, metadata: { status } }); return NextResponse.json(thread); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}

export async function DELETE(req, { params }) {
  try { const admin = await requireAdmin(); await db.discussionThread.delete({ where: { id: params.threadId } }); await writeAuditLog({ actorId: admin.id, action: "DISCUSSION_DELETED", entityType: "DiscussionThread", entityId: params.threadId }); return new NextResponse(null, { status: 204 }); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
