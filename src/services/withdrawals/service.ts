import { prisma } from "@/src/lib/db/prisma";
import type { CreateWithdrawalInput } from "@/src/lib/validations/withdrawals";

export async function listWithdrawals() {
  return prisma.withdrawal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      coinBox: true,
      house: true,
      collector: true
    }
  });
}

export async function createWithdrawal(input: CreateWithdrawalInput, collectorId: number) {
  const [coinBox, house] = await Promise.all([
    prisma.coinBox.findFirst({ where: { id: input.coinBoxId, deletedAt: null } }),
    prisma.house.findFirst({ where: { id: input.houseId, deletedAt: null } })
  ]);

  if (!coinBox || !house) throw new Error("INVALID_RELATION");

  const assignment = await prisma.coinBoxAssignment.findFirst({
    where: {
      coinBoxId: coinBox.id,
      houseId: house.id,
      status: "ACTIVE"
    }
  });

  if (!assignment) throw new Error("INVALID_RELATION");

  return prisma.withdrawal.create({
    data: {
      coinBoxId: coinBox.id,
      houseId: house.id,
      collectorId,
      amount: input.amount,
      notes: input.notes,
      collectedAt: input.collectedAt ?? new Date(),
      status: "PENDING"
    },
    include: { coinBox: true, house: true, collector: true }
  });
}

export async function validateWithdrawal(id: number) {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
  if (!withdrawal) throw new Error("NOT_FOUND");
  if (withdrawal.status !== "PENDING") throw new Error("INVALID_STATUS");

  const category = await prisma.financialCategory.findFirst({ where: { code: "KOIN_RUTIN" } });
  if (!category) throw new Error("INVALID_RELATION");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.withdrawal.update({
      where: { id },
      data: { status: "VALIDATED", validatedAt: new Date(), rejectedAt: null },
      include: { coinBox: true, house: true, collector: true }
    });

    await tx.cashTransaction.create({
      data: {
        categoryId: category.id,
        withdrawalId: updated.id,
        type: "INCOME",
        amount: updated.amount,
        description: "Pemasukan KOIN NU tervalidasi",
        transactionAt: updated.validatedAt ?? new Date()
      }
    });

    return updated;
  });
}

export async function rejectWithdrawal(id: number, reason?: string) {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
  if (!withdrawal) throw new Error("NOT_FOUND");
  if (withdrawal.status !== "PENDING") throw new Error("INVALID_STATUS");

  return prisma.withdrawal.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      notes: reason ? `${withdrawal.notes ?? ""}\nAlasan ditolak: ${reason}`.trim() : withdrawal.notes
    },
    include: { coinBox: true, house: true, collector: true }
  });
}

export function serializeWithdrawal(withdrawal: Awaited<ReturnType<typeof listWithdrawals>>[number]) {
  return {
    id: withdrawal.id,
    boxNumber: withdrawal.coinBox.boxNumber,
    coinBoxId: withdrawal.coinBoxId,
    houseId: withdrawal.houseId,
    houseName: withdrawal.house.name,
    amount: withdrawal.amount,
    collector: withdrawal.collector.name,
    status: withdrawal.status,
    notes: withdrawal.notes ?? "",
    createdAt: withdrawal.createdAt.toISOString()
  };
}
