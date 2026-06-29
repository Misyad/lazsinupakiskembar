import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/db/prisma";
import { auditMetadata, createAuditLog } from "@/src/lib/audit/audit";
import { BusinessRuleError } from "@/src/lib/api/errors";
import type { CreateWithdrawalInput } from "@/src/lib/validations/withdrawals";

const withdrawalInclude = {
  coinBox: true,
  house: true,
  collector: true
} satisfies Prisma.WithdrawalInclude;

export async function listWithdrawals() {
  return prisma.withdrawal.findMany({
    orderBy: { createdAt: "desc" },
    include: withdrawalInclude
  });
}

export async function createWithdrawal(
  input: CreateWithdrawalInput,
  collectorId: number,
  ipAddress?: string | null
) {
  if (input.amount <= 0) {
    throw new BusinessRuleError("INVALID_AMOUNT", "Nominal penarikan harus lebih dari 0.");
  }

  return prisma.$transaction(async (tx) => {
    const [coinBox, house] = await Promise.all([
      tx.coinBox.findFirst({ where: { id: input.coinBoxId, deletedAt: null } }),
      tx.house.findFirst({ where: { id: input.houseId, deletedAt: null } })
    ]);

    if (!coinBox || !house) throw new Error("INVALID_RELATION");
    if (coinBox.status !== "ACTIVE") {
      throw new BusinessRuleError("COIN_BOX_NOT_ACTIVE", "Kaleng harus aktif untuk penarikan.");
    }
    if (!house.active) {
      throw new BusinessRuleError("HOUSE_NOT_ACTIVE", "Rumah harus aktif untuk penarikan.");
    }

    const assignment = await tx.coinBoxAssignment.findFirst({
      where: {
        coinBoxId: coinBox.id,
        houseId: house.id,
        status: "ACTIVE",
        unassignedAt: null
      }
    });

    if (!assignment) {
      throw new BusinessRuleError("NO_ACTIVE_ASSIGNMENT", "Assignment aktif kaleng dan rumah tidak ditemukan.");
    }

    const withdrawal = await tx.withdrawal.create({
      data: {
        coinBoxId: coinBox.id,
        houseId: house.id,
        collectorId,
        amount: input.amount,
        notes: input.notes,
        collectedAt: input.collectedAt ?? new Date(),
        status: "PENDING"
      },
      include: withdrawalInclude
    });

    await createAuditLog({
      tx,
      actorId: collectorId,
      action: "withdrawal.create",
      entityType: "Withdrawal",
      entityId: withdrawal.id,
      ipAddress,
      metadata: auditMetadata({
        after: serializeWithdrawal(withdrawal)
      })
    });

    return withdrawal;
  });
}

export async function validateWithdrawal(id: number, actorId: number, ipAddress?: string | null) {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUnique({
      where: { id },
      include: withdrawalInclude
    });

    if (!withdrawal) throw new Error("NOT_FOUND");
    if (withdrawal.status !== "PENDING") {
      throw new BusinessRuleError("INVALID_STATUS", "Hanya penarikan pending yang bisa divalidasi.");
    }
    if (withdrawal.collectorId === actorId) {
      throw new BusinessRuleError("SELF_VALIDATION_NOT_ALLOWED", "Collector tidak boleh memvalidasi penarikannya sendiri.", 403);
    }
    if (withdrawal.amount <= 0) {
      throw new BusinessRuleError("INVALID_AMOUNT", "Nominal penarikan harus lebih dari 0.");
    }
    if (withdrawal.coinBox.status !== "ACTIVE") {
      throw new BusinessRuleError("COIN_BOX_NOT_ACTIVE", "Kaleng harus aktif saat validasi.");
    }
    if (!withdrawal.house.active || withdrawal.house.deletedAt) {
      throw new BusinessRuleError("HOUSE_NOT_ACTIVE", "Rumah harus aktif saat validasi.");
    }

    const assignment = await tx.coinBoxAssignment.findFirst({
      where: {
        coinBoxId: withdrawal.coinBoxId,
        houseId: withdrawal.houseId,
        status: "ACTIVE",
        unassignedAt: null
      }
    });

    if (!assignment) {
      throw new BusinessRuleError("NO_ACTIVE_ASSIGNMENT", "Assignment aktif kaleng dan rumah tidak ditemukan.");
    }

    const existingLedger = await tx.cashTransaction.findFirst({
      where: { withdrawalId: id, status: { not: "VOIDED" } }
    });
    if (existingLedger) {
      throw new BusinessRuleError("DUPLICATE_LEDGER", "Ledger penarikan ini sudah pernah dibuat.");
    }

    const category = await tx.financialCategory.findFirst({
      where: { code: "KOIN_RUTIN", deletedAt: null }
    });
    if (!category) throw new Error("INVALID_RELATION");

    const updatedCount = await tx.withdrawal.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "VALIDATED", validatedAt: new Date(), rejectedAt: null, voidedAt: null, voidReason: null }
    });
    if (updatedCount.count !== 1) {
      throw new BusinessRuleError("CONCURRENT_MUTATION", "Status penarikan berubah oleh proses lain. Muat ulang data.");
    }

    await tx.cashTransaction.create({
      data: {
        categoryId: category.id,
        withdrawalId: id,
        type: "INCOME",
        status: "VALIDATED",
        referenceType: "WITHDRAWAL",
        referenceId: id,
        amount: withdrawal.amount,
        description: "Pemasukan KOIN NU tervalidasi",
        transactionAt: new Date(),
        validatedAt: new Date(),
        createdById: actorId,
        validatedById: actorId
      }
    });

    const updated = await tx.withdrawal.findUniqueOrThrow({
      where: { id },
      include: withdrawalInclude
    });

    await createAuditLog({
      tx,
      actorId,
      action: "withdrawal.validate",
      entityType: "Withdrawal",
      entityId: id,
      ipAddress,
      metadata: auditMetadata({
        before: serializeWithdrawal(withdrawal),
        after: serializeWithdrawal(updated)
      })
    });

    return updated;
  });
}

export async function rejectWithdrawal(id: number, actorId: number, reason: string, ipAddress?: string | null) {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUnique({
      where: { id },
      include: withdrawalInclude
    });
    if (!withdrawal) throw new Error("NOT_FOUND");
    if (withdrawal.status !== "PENDING") {
      throw new BusinessRuleError("INVALID_STATUS", "Hanya penarikan pending yang bisa ditolak.");
    }

    const updatedCount = await tx.withdrawal.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        notes: `${withdrawal.notes ?? ""}\nAlasan ditolak: ${reason}`.trim()
      }
    });
    if (updatedCount.count !== 1) {
      throw new BusinessRuleError("CONCURRENT_MUTATION", "Status penarikan berubah oleh proses lain. Muat ulang data.");
    }

    const updated = await tx.withdrawal.findUniqueOrThrow({
      where: { id },
      include: withdrawalInclude
    });

    await createAuditLog({
      tx,
      actorId,
      action: "withdrawal.reject",
      entityType: "Withdrawal",
      entityId: id,
      ipAddress,
      metadata: auditMetadata({
        before: serializeWithdrawal(withdrawal),
        after: serializeWithdrawal(updated),
        reason
      })
    });

    return updated;
  });
}

export async function voidWithdrawal(id: number, actorId: number, reason: string, ipAddress?: string | null) {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUnique({
      where: { id },
      include: withdrawalInclude
    });
    if (!withdrawal) throw new Error("NOT_FOUND");
    if (withdrawal.status !== "VALIDATED") {
      throw new BusinessRuleError("INVALID_STATUS", "Hanya penarikan tervalidasi yang bisa divoid.");
    }

    const ledger = await tx.cashTransaction.findUnique({ where: { withdrawalId: id } });
    if (!ledger || ledger.status !== "VALIDATED") {
      throw new BusinessRuleError("LEDGER_NOT_VALIDATED", "Ledger tervalidasi tidak ditemukan.");
    }

    const updatedCount = await tx.withdrawal.updateMany({
      where: { id, status: "VALIDATED" },
      data: { status: "VOIDED", voidedAt: new Date(), voidReason: reason }
    });
    if (updatedCount.count !== 1) {
      throw new BusinessRuleError("CONCURRENT_MUTATION", "Status penarikan berubah oleh proses lain. Muat ulang data.");
    }

    await tx.cashTransaction.update({
      where: { id: ledger.id },
      data: {
        status: "VOIDED",
        voidedAt: new Date(),
        reason
      }
    });

    const updated = await tx.withdrawal.findUniqueOrThrow({
      where: { id },
      include: withdrawalInclude
    });

    await createAuditLog({
      tx,
      actorId,
      action: "withdrawal.void",
      entityType: "Withdrawal",
      entityId: id,
      ipAddress,
      metadata: auditMetadata({
        before: serializeWithdrawal(withdrawal),
        after: serializeWithdrawal(updated),
        reason
      })
    });

    return updated;
  });
}

export function serializeWithdrawal(withdrawal: Prisma.WithdrawalGetPayload<{ include: typeof withdrawalInclude }>) {
  return {
    id: withdrawal.id,
    boxNumber: withdrawal.coinBox.boxNumber,
    coinBoxId: withdrawal.coinBoxId,
    houseId: withdrawal.houseId,
    houseName: withdrawal.house.headOfFamily,
    amount: withdrawal.amount,
    collectorId: withdrawal.collectorId,
    collector: withdrawal.collector.name,
    status: withdrawal.status,
    notes: withdrawal.notes ?? "",
    voidReason: withdrawal.voidReason ?? "",
    createdAt: withdrawal.createdAt.toISOString()
  };
}
