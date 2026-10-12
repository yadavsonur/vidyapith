import { db } from "@/lib/db";

export const writeAuditLog = async ({ actorId = null, action, entityType, entityId = null, metadata = null, tx = db }) =>
  tx.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadata: metadata == null ? undefined : metadata,
    },
  });
