import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { serializeWithdrawal, validateWithdrawal } from "@/src/services/withdrawals/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.withdrawalsValidate);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const withdrawal = await validateWithdrawal(Number(id));
    await writeAuditLog({
      actorId: user.id,
      action: "withdrawal.validate",
      entityType: "Withdrawal",
      entityId: withdrawal.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ withdrawal: serializeWithdrawal(withdrawal) });
  } catch (error) {
    return jsonError(error);
  }
}
