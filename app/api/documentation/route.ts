import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { createDocumentationSchema } from "@/src/lib/validations/content";
import { createDocumentation, listDocumentationAdmin, serializeDocumentation } from "@/src/services/content/service";

export async function GET() {
  const { response } = await requireApiPermission(permissions.settingsManage);
  if (response) return response;

  const documentation = await listDocumentationAdmin();
  return Response.json({ documentation: documentation.map(serializeDocumentation) });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.settingsManage);
  if (response || !user) return response;

  try {
    const input = createDocumentationSchema.parse(await request.json());
    const doc = await createDocumentation(input);
    await writeAuditLog({
      actorId: user.id,
      action: "documentation.create",
      entityType: "Documentation",
      entityId: doc.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ documentation: serializeDocumentation(doc) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
