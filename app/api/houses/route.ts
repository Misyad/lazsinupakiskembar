import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { createHouseSchema } from "@/src/lib/validations/houses";
import { createHouse, listHouses, serializeHouse } from "@/src/services/houses/service";

export async function GET() {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  const houses = await listHouses();
  return Response.json({ houses: houses.map(serializeHouse) });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.housesCreate);
  if (response || !user) return response;

  try {
    const input = createHouseSchema.parse(await request.json());
    const house = await createHouse(input);
    await writeAuditLog({
      actorId: user.id,
      action: "house.create",
      entityType: "House",
      entityId: house.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ house: serializeHouse(house) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
