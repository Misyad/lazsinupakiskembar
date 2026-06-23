import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { updateDocumentationSchema } from "@/src/lib/validations/content";
import { deleteDocumentation, serializeDocumentation, updateDocumentation } from "@/src/services/content/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.settingsManage);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const input = updateDocumentationSchema.parse(await request.json());
    const doc = await updateDocumentation(Number(id), input);
    await writeAuditLog({
      actorId: user.id,
      action: "documentation.update",
      entityType: "Documentation",
      entityId: doc.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ documentation: serializeDocumentation(doc) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.settingsManage);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const doc = await deleteDocumentation(Number(id));
    await writeAuditLog({
      actorId: user.id,
      action: "documentation.delete",
      entityType: "Documentation",
      entityId: doc.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
