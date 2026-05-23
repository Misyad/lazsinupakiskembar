import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { createWithdrawalSchema } from "@/src/lib/validations/withdrawals";
import { createWithdrawal, listWithdrawals, serializeWithdrawal } from "@/src/services/withdrawals/service";

export async function GET() {
  const { response } = await requireApiPermission(permissions.withdrawalsRead);
  if (response) return response;

  const withdrawals = await listWithdrawals();
  return Response.json({ withdrawals: withdrawals.map(serializeWithdrawal) });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.withdrawalsCreate);
  if (response || !user) return response;

  try {
    const input = createWithdrawalSchema.parse(await request.json());
    const withdrawal = await createWithdrawal(input, user.id);
    await writeAuditLog({
      actorId: user.id,
      action: "withdrawal.create",
      entityType: "Withdrawal",
      entityId: withdrawal.id,
      ipAddress: requestIp(request)
    });
    return Response.json({ withdrawal: serializeWithdrawal(withdrawal) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
