import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { assignCoinBoxSchema } from "@/src/lib/validations/coin-boxes";
import { assignCoinBox } from "@/src/services/coin-boxes/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.coinBoxesAssign);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const input = assignCoinBoxSchema.parse(await request.json());
    const assignment = await assignCoinBox(Number(id), input, user.id, requestIp(request));
    return Response.json({ assignment }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
