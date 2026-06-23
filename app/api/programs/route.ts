import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { createProgramSchema } from "@/src/lib/validations/content";
import { createProgram, listProgramsAdmin, serializeProgram } from "@/src/services/content/service";

export async function GET() {
  const { response } = await requireApiPermission(permissions.settingsManage);
  if (response) return response;

  const programs = await listProgramsAdmin();
  return Response.json({ programs: programs.map(serializeProgram) });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.settingsManage);
  if (response || !user) return response;

  try {
    const input = createProgramSchema.parse(await request.json());
    const program = await createProgram(input);
    await writeAuditLog({
      actorId: user.id,
      action: "program.create",
      entityType: "Program",
      entityId: program.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ program: serializeProgram(program) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
