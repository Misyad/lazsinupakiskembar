import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { prisma } from "@/src/lib/db/prisma";

export async function GET() {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  const houses = await prisma.house.findMany({
    where: { deletedAt: null, latitude: { not: null }, longitude: { not: null } },
    include: {
      area: true,
      assignments: {
        where: { status: "ACTIVE" },
        include: { coinBox: true },
        take: 1
      },
      withdrawals: {
        orderBy: { collectedAt: "desc" },
        take: 1
      }
    }
  });

  const features = houses.map((h) => ({
    type: "Feature" as const,
    id: h.id,
    geometry: {
      type: "Point" as const,
      coordinates: [h.longitude!, h.latitude!]
    },
    properties: {
      id: h.id,
      name: h.name,
      address: h.address,
      rt: h.rt || h.rtRw?.split("/")[0] || "",
      rw: h.rw || h.rtRw?.split("/")[1] || "",
      dusun: h.dusun || "",
      phone: h.phone,
      active: h.active,
      boxNumber: h.assignments[0]?.coinBox?.boxNumber || null,
      boxStatus: h.assignments[0]?.coinBox?.status || null,
      lastWithdrawal: h.withdrawals[0]?.collectedAt || null,
      lastAmount: h.withdrawals[0]?.amount || null,
      status: !h.active ? "inactive" : !h.assignments[0] ? "unassigned" : "active"
    }
  }));

  return Response.json({
    type: "FeatureCollection",
    features,
    total: houses.length
  });
}
