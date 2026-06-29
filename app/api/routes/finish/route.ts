import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { jsonError } from "@/src/lib/api/errors";
import { prisma } from "@/src/lib/db/prisma";

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.withdrawalsCreate);
  if (response || !user) return response;

  try {
    const { routeId } = await request.json();
    const route = await prisma.routeCollection.update({
      where: { id: routeId },
      data: { status: "completed", selesaiDi: new Date() }
    });
    return Response.json({ route });
  } catch (error) {
    return jsonError(error);
  }
}
