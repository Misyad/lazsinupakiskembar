import { requireApiPermission } from "@/lib/auth";
import { requestIp } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { permissions } from "@/src/lib/permissions/permissions";
import { createExpenseSchema } from "@/src/lib/validations/finance";
import { createExpense, serializeCashTransaction } from "@/src/services/finance/service";

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.financeExpensesCreate);
  if (response || !user) return response;

  try {
    const input = createExpenseSchema.parse(await request.json());
    const transaction = await createExpense(input, user.id, requestIp(request));
    return Response.json({ transaction: serializeCashTransaction(transaction) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
