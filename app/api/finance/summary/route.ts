import { requireApiPermission } from "@/lib/auth";
import { permissions } from "@/src/lib/permissions/permissions";
import { getFinanceSummary } from "@/src/services/finance/service";

export async function GET() {
  const { response } = await requireApiPermission(permissions.financeRead);
  if (response) return response;

  const summary = await getFinanceSummary();
  return Response.json({ summary });
}
