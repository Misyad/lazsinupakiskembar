import { requireApiPermission } from "@/lib/auth";
import { requestIp } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { permissions } from "@/src/lib/permissions/permissions";
import { createAdjustmentSchema } from "@/src/lib/validations/finance";
import { createAdjustment, serializeCashTransaction } from "@/src/services/finance/service";

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.financeAdjustmentsCreate);
  if (response || !user) return response;

  try {
    const input = createAdjustmentSchema.parse(await request.json());
    const transaction = await createAdjustment(input, user.id, requestIp(request));
    return Response.json({ transaction: serializeCashTransaction(transaction) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
