import { clearSession } from "@/lib/auth";
import { apiJson, applyCorsOrigin, corsPreflight } from "@/lib/api-response";

export async function POST(request: Request) {
  await clearSession();
  return applyCorsOrigin(apiJson({ ok: true }), request);
}

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}
