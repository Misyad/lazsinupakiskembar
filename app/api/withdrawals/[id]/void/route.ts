import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { voidWithdrawalSchema } from "@/src/lib/validations/withdrawals";
import { serializeWithdrawal, voidWithdrawal } from "@/src/services/withdrawals/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.withdrawalsVoid);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const input = voidWithdrawalSchema.parse(await request.json().catch(() => ({})));
    const withdrawal = await voidWithdrawal(Number(id), user.id, input.reason, requestIp(request));
    return Response.json({ withdrawal: serializeWithdrawal(withdrawal) });
  } catch (error) {
    return jsonError(error);
  }
}
