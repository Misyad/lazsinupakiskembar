import { prisma } from "@/src/lib/db/prisma";
import type { CreateHouseInput, UpdateHouseInput } from "@/src/lib/validations/houses";

export async function listHouses() {
  return prisma.house.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      area: true,
      assignments: {
        where: { status: "ACTIVE" },
        include: { coinBox: true },
        take: 1
      }
    }
  });
}

export async function createHouse(input: CreateHouseInput) {
  const area = input.areaId
    ? await prisma.area.findFirst({ where: { id: input.areaId, deletedAt: null } })
    : await prisma.area.findFirst({ where: { code: "PAKISKEMBAR", deletedAt: null } });

  if (!area) throw new Error("INVALID_RELATION");

  return prisma.house.create({
    data: {
      areaId: area.id,
      name: input.name,
      phone: input.phone || null,
      address: input.address,
      rtRw: input.rtRw,
      joinedAt: input.joinedAt ?? new Date()
    },
    include: { area: true, assignments: { include: { coinBox: true } } }
  });
}

export async function updateHouse(id: number, input: UpdateHouseInput) {
  const house = await prisma.house.findFirst({ where: { id, deletedAt: null } });
  if (!house) throw new Error("NOT_FOUND");

  if (input.areaId) {
    const area = await prisma.area.findFirst({ where: { id: input.areaId, deletedAt: null } });
    if (!area) throw new Error("INVALID_RELATION");
  }

  return prisma.house.update({
    where: { id },
    data: {
      areaId: input.areaId,
      name: input.name,
      phone: input.phone === "" ? null : input.phone,
      address: input.address,
      rtRw: input.rtRw,
      joinedAt: input.joinedAt,
      active: input.active
    },
    include: { area: true, assignments: { include: { coinBox: true } } }
  });
}

export async function deleteHouse(id: number) {
  const house = await prisma.house.findFirst({ where: { id, deletedAt: null } });
  if (!house) throw new Error("NOT_FOUND");

  return prisma.house.update({
    where: { id },
    data: {
      active: false,
      deletedAt: new Date()
    }
  });
}

export function serializeHouse(house: Awaited<ReturnType<typeof listHouses>>[number]) {
  const assignment = house.assignments[0];
  return {
    id: house.id,
    name: house.name,
    phone: house.phone ?? "",
    address: house.address,
    rtRw: house.rtRw,
    village: house.area.name,
    active: house.active,
    joinedAt: house.joinedAt.toISOString().slice(0, 10),
    boxNumber: assignment?.coinBox.boxNumber ?? "-"
  };
}
