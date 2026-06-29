import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { prisma } from "@/src/lib/db/prisma";

export async function GET() {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  const routes = await prisma.routeCollection.findMany({
    orderBy: { tanggal: "desc" },
    take: 50,
    include: { petugas: { select: { id: true, name: true } } }
  });

  return Response.json({ routes });
}
