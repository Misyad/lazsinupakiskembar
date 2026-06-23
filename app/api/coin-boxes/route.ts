import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { createCoinBoxSchema } from "@/src/lib/validations/coin-boxes";
import { createCoinBox, listCoinBoxes, serializeCoinBox } from "@/src/services/coin-boxes/service";

export async function GET() {
  const { response } = await requireApiPermission(permissions.coinBoxesRead);
  if (response) return response;

  const boxes = await listCoinBoxes();
  return Response.json({ coinBoxes: boxes.map(serializeCoinBox) });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.coinBoxesCreate);
  if (response || !user) return response;

  try {
    const input = createCoinBoxSchema.parse(await request.json());
    const coinBox = await createCoinBox(input);
    await writeAuditLog({
      actorId: user.id,
      action: "coin_box.create",
      entityType: "CoinBox",
      entityId: coinBox.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ coinBox }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
