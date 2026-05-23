import { prisma } from "@/src/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type AuditClient = Prisma.TransactionClient | typeof prisma;

export async function createAuditLog(input: {
  actorId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  ipAddress?: string | null;
  metadata?: Prisma.InputJsonValue;
  tx?: AuditClient;
}) {
  const client = input.tx ?? prisma;
  await client.auditLog.create({
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

export const writeAuditLog = createAuditLog;

export function auditMetadata(input: {
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  reason?: string;
  source?: string;
}) {
  return {
    before: input.before ?? {},
    after: input.after ?? {},
    reason: input.reason ?? "",
    source: input.source ?? "web"
  } satisfies Prisma.InputJsonValue;
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
