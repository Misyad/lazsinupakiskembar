import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError } from "@/src/lib/api/errors";
import { prisma } from "@/src/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { user, response } = await requireApiPermission(permissions.housesUpdate);
  if (response || !user) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { type, file } = body;

    if (!type || !file) {
      return Response.json({ error: "type dan file wajib diisi" }, { status: 400 });
    }

    const photo = await prisma.housePhoto.create({
      data: {
        houseId: Number(id),
        type,
        file,
      }
    });

    await writeAuditLog({
      actorId: user.id,
      action: "house.photo.add",
      entityType: "HousePhoto",
      entityId: photo.id,
      ipAddress: requestIp(request),
      metadata: { houseId: Number(id), type }
    });

    return Response.json({ photo }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
