import { prisma } from "@/src/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export type AuditLogFilter = {
  action?: string;
  entityType?: string;
  actorId?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export async function listAuditLogs(filter: AuditLogFilter = {}) {
  const where: Prisma.AuditLogWhereInput = {};

  if (filter.action) {
    where.action = { contains: filter.action, mode: "insensitive" };
  }
  if (filter.entityType) {
    where.entityType = { equals: filter.entityType, mode: "insensitive" };
  }
  if (filter.actorId) {
    where.actorId = filter.actorId;
  }
  if (filter.from || filter.to) {
    where.createdAt = {};
    if (filter.from) where.createdAt.gte = new Date(filter.from);
    if (filter.to) where.createdAt.lte = new Date(filter.to);
  }

  const take = Math.min(filter.limit ?? 100, 500);
  const skip = filter.offset ?? 0;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        actor: {
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total, limit: take, offset: skip };
}

export function serializeAuditLog(
  log: Awaited<ReturnType<typeof listAuditLogs>>["logs"][number]
) {
  return {
    id: String(log.id),
    actorId: log.actorId,
    actorName: log.actor?.name ?? "Sistem",
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    ipAddress: log.ipAddress,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString()
  };
}
