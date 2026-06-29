import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { prisma } from "@/src/lib/db/prisma";

export async function GET() {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  const users = await prisma.user.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
      userRoles: { select: { role: { select: { code: true, name: true } } }, take: 1 }
    },
    orderBy: { name: "asc" }
  });

  return Response.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.userRoles[0]?.role?.code || ""
    }))
  });
}
