import { requireApiPermission } from "@/lib/auth";
import { permissions } from "@/src/lib/permissions/permissions";
import { listFinanceTransactions } from "@/src/services/finance/service";

export async function GET() {
  const { response } = await requireApiPermission(permissions.financeRead);
  if (response) return response;

  const transactions = await listFinanceTransactions();
  return Response.json({ transactions });
}
