import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { jsonError } from "@/src/lib/api/errors";
import { prisma } from "@/src/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  try {
    const { id } = await params;
    const houseId = Number(id);

    const house = await prisma.house.findFirst({
      where: { id: houseId, deletedAt: null },
      include: {
        area: true,
        assignments: {
          include: { coinBox: true },
          orderBy: { assignedAt: "desc" }
        },
        withdrawals: {
          orderBy: { collectedAt: "desc" },
          take: 20,
          include: { collector: { select: { id: true, name: true } } }
        }
      }
    });

    if (!house) {
      return Response.json({ error: "House not found" }, { status: 404 });
    }

    return Response.json({
      house: {
        id: house.id,
        name: house.headOfFamily,
        address: house.address,
        rt: house.rt || house.rtRw?.split("/")[0] || "",
        rw: house.rw || house.rtRw?.split("/")[1] || "",
        dusun: house.hamlet || "",
        phone: house.phone,
        latitude: house.latitude,
        longitude: house.longitude,
        status: house.status,
        area: house.area.name
      },
      coinBoxHistory: house.assignments.map((a) => ({
        id: a.id,
        boxNumber: a.coinBox.boxNumber,
        status: a.coinBox.status,
        assignedAt: a.assignedAt,
        unassignedAt: a.unassignedAt
      })),
      withdrawals: house.withdrawals.map((w) => ({
        id: w.id,
        amount: w.amount,
        status: w.status,
        collectedAt: w.collectedAt,
        collector: w.collector.name,
        latitude: w.latitude,
        longitude: w.longitude,
        notes: w.notes
      }))
    });
  } catch (error) {
    return jsonError(error);
  }
}
