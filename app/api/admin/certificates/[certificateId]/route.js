import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";
export async function PATCH(req, { params }) {
  try { const admin = await requireAdmin(); const revoked = (await req.json()).revoked === true; const certificate = await db.certificate.update({ where: { id: params.certificateId }, data: { revokedAt: revoked ? new Date() : null } }); await writeAuditLog({ actorId: admin.id, action: revoked ? "CERTIFICATE_REVOKED" : "CERTIFICATE_REINSTATED", entityType: "Certificate", entityId: certificate.id }); return NextResponse.json(certificate); }
  catch (error) { return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 }); }
}
