import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { prisma } from "@/src/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.housesUpdate);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { latitude, longitude } = body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return Response.json({ error: "latitude and longitude must be numbers" }, { status: 400 });
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return Response.json({ error: "invalid coordinates" }, { status: 400 });
    }

    const house = await prisma.house.update({
      where: { id: Number(id), deletedAt: null },
      data: { latitude, longitude }
    });

    await writeAuditLog({
      actorId: user.id,
      action: "house.location.update",
      entityType: "House",
      entityId: String(id),
      metadata: { latitude, longitude },
      ipAddress: requestIp(request)
    });

    return Response.json({ house: { id: house.id, latitude: house.latitude, longitude: house.longitude } });
  } catch (error) {
    return jsonError(error);
  }
}
