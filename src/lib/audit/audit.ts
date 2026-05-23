import { prisma } from "@/src/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditLog(input: {
  actorId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  ipAddress?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId == null ? null : String(input.entityId),
      ipAddress: input.ipAddress ?? null,
      metadata: input.metadata
    }
  });
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
