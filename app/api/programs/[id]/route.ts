import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { updateProgramSchema } from "@/src/lib/validations/content";
import { deleteProgram, serializeProgram, updateProgram } from "@/src/services/content/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.settingsManage);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const input = updateProgramSchema.parse(await request.json());
    const program = await updateProgram(Number(id), input);
    await writeAuditLog({
      actorId: user.id,
      action: "program.update",
      entityType: "Program",
      entityId: program.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ program: serializeProgram(program) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.settingsManage);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const program = await deleteProgram(Number(id));
    await writeAuditLog({
      actorId: user.id,
      action: "program.delete",
      entityType: "Program",
      entityId: program.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
