import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { jsonError } from "@/src/lib/api/errors";
import { listAuditLogs, serializeAuditLog } from "@/src/services/audit-logs/service";

export async function GET(request: Request) {
  const { response } = await requireApiPermission(permissions.auditRead);
  if (response) return response;

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? undefined;
    const entityType = url.searchParams.get("entityType") ?? undefined;
    const actorId = url.searchParams.get("actorId");
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");

    const result = await listAuditLogs({
      action,
      entityType,
      actorId: actorId ? Number(actorId) : undefined,
      from,
      to,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    return Response.json({
      auditLogs: result.logs.map(serializeAuditLog),
      total: result.total,
      limit: result.limit,
      offset: result.offset
    });
  } catch (error) {
    return jsonError(error);
  }
}
