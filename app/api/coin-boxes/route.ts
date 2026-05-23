import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
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
  const { response } = await requireApiPermission(permissions.coinBoxesCreate);
  if (response) return response;

  try {
    const input = createCoinBoxSchema.parse(await request.json());
    const coinBox = await createCoinBox(input);
    return Response.json({ coinBox }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
