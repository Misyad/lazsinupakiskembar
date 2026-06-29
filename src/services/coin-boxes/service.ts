import { prisma } from "@/src/lib/db/prisma";
import type { AssignCoinBoxInput, CreateCoinBoxInput } from "@/src/lib/validations/coin-boxes";
import { auditMetadata, createAuditLog } from "@/src/lib/audit/audit";
import { BusinessRuleError } from "@/src/lib/api/errors";

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

export async function assignCoinBox(id: number, input: AssignCoinBoxInput, actorId?: number, ipAddress?: string | null) {
  const coinBox = await prisma.coinBox.findFirst({ where: { id, deletedAt: null } });
  const house = await prisma.house.findFirst({ where: { id: input.houseId, deletedAt: null } });

  if (!coinBox || !house) throw new Error("INVALID_RELATION");
  if (coinBox.status !== "ACTIVE") {
    throw new BusinessRuleError("COIN_BOX_NOT_ACTIVE", "Kaleng harus berstatus aktif untuk di-assign.");
  }
  if (!house.active) {
    throw new BusinessRuleError("HOUSE_NOT_ACTIVE", "Rumah harus aktif untuk menerima assignment kaleng.");
  }

  return prisma.$transaction(async (tx) => {
    const activeAssignments = await tx.coinBoxAssignment.findMany({
      where: { coinBoxId: id, status: "ACTIVE" }
    });
    await tx.coinBoxAssignment.updateMany({
      where: { coinBoxId: id, status: "ACTIVE" },
      data: { status: "ENDED", unassignedAt: new Date() }
    });

    const assignment = await tx.coinBoxAssignment.create({
      data: {
        coinBoxId: id,
        houseId: input.houseId,
        assignedAt: input.assignedAt ?? new Date(),
        status: "ACTIVE"
      },
      include: { coinBox: true, house: true }
    });

    await createAuditLog({
      tx,
      actorId,
      action: "coin_box.assign",
      entityType: "CoinBoxAssignment",
      entityId: assignment.id,
      ipAddress,
      metadata: auditMetadata({
        before: { activeAssignments },
        after: { assignmentId: assignment.id, coinBoxId: id, houseId: input.houseId }
      })
    });

    return assignment;
  });
}

export function serializeCoinBox(box: Awaited<ReturnType<typeof listCoinBoxes>>[number]) {
  const assignment = box.assignments[0];
  return {
    id: box.id,
    boxNumber: box.boxNumber,
    status: box.status,
    houseId: assignment?.houseId ?? null,
    houseName: assignment?.house?.headOfFamily ?? "Belum terhubung",
    distributedAt: box.distributedAt?.toISOString().slice(0, 10) ?? "-"
  };
}
