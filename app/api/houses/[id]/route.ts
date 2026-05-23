import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { updateHouseSchema } from "@/src/lib/validations/houses";
import { deleteHouse, serializeHouse, updateHouse } from "@/src/services/houses/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.housesUpdate);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const input = updateHouseSchema.parse(await request.json());
    const house = await updateHouse(Number(id), input);
    await writeAuditLog({
      actorId: user.id,
      action: "house.update",
      entityType: "House",
      entityId: house.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ house: serializeHouse(house) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.housesDelete);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const house = await deleteHouse(Number(id));
    await writeAuditLog({
      actorId: user.id,
      action: "house.delete",
      entityType: "House",
      entityId: house.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
