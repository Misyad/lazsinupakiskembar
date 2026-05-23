import { prisma } from "@/src/lib/db/prisma";
import type { AssignCoinBoxInput, CreateCoinBoxInput } from "@/src/lib/validations/coin-boxes";

export async function listCoinBoxes() {
  return prisma.coinBox.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      assignments: {
        where: { status: "ACTIVE" },
        include: { house: true },
        take: 1
      }
    }
  });
}

export async function createCoinBox(input: CreateCoinBoxInput) {
  return prisma.coinBox.create({
    data: {
      boxNumber: input.boxNumber,
      status: input.status ?? "ACTIVE",
      distributedAt: input.distributedAt ?? null
    }
  });
}

export async function assignCoinBox(id: number, input: AssignCoinBoxInput) {
  const coinBox = await prisma.coinBox.findFirst({ where: { id, deletedAt: null } });
  const house = await prisma.house.findFirst({ where: { id: input.houseId, deletedAt: null } });

  if (!coinBox || !house) throw new Error("INVALID_RELATION");

  return prisma.$transaction(async (tx) => {
    await tx.coinBoxAssignment.updateMany({
      where: { coinBoxId: id, status: "ACTIVE" },
      data: { status: "ENDED", endedAt: new Date() }
    });

    return tx.coinBoxAssignment.create({
      data: {
        coinBoxId: id,
        houseId: input.houseId,
        assignedAt: input.assignedAt ?? new Date(),
        status: "ACTIVE"
      },
      include: { coinBox: true, house: true }
    });
  });
}

export function serializeCoinBox(box: Awaited<ReturnType<typeof listCoinBoxes>>[number]) {
  const assignment = box.assignments[0];
  return {
    id: box.id,
    boxNumber: box.boxNumber,
    status: box.status,
    houseId: assignment?.houseId ?? null,
    houseName: assignment?.house.name ?? "Belum terhubung",
    distributedAt: box.distributedAt?.toISOString().slice(0, 10) ?? "-"
  };
}
