import { getCurrentUser } from "@/lib/auth";
import { apiJson, applyCorsOrigin, corsPreflight } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return applyCorsOrigin(apiJson({ user: null }, { status: 401 }), request);
  }

  return applyCorsOrigin(apiJson({ user }), request);
}

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}
