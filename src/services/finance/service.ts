import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/db/prisma";
import { auditMetadata, createAuditLog } from "@/src/lib/audit/audit";
import { BusinessRuleError } from "@/src/lib/api/errors";
import type { CreateAdjustmentInput, CreateExpenseInput } from "@/src/lib/validations/finance";

const transactionInclude = {
  category: true,
  withdrawal: {
    include: {
      house: true,
      coinBox: true
    }
  },
  createdBy: true,
  validatedBy: true
} satisfies Prisma.CashTransactionInclude;

export async function getFinanceSummary() {
  const [validated, pendingWithdrawals, activeHouses, activeBoxes] = await Promise.all([
    prisma.cashTransaction.groupBy({
      by: ["type"],
      where: { status: "VALIDATED" },
      _sum: { amount: true }
    }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.house.count({ where: { status: "aktif", deletedAt: null } }),
    prisma.coinBox.count({ where: { status: "ACTIVE", deletedAt: null } })
  ]);

  const sum = (type: "INCOME" | "EXPENSE" | "ADJUSTMENT") =>
    validated.find((item) => item.type === type)?._sum.amount ?? 0;
  const income = sum("INCOME");
  const expense = sum("EXPENSE");
  const adjustment = sum("ADJUSTMENT");

  return {
    income,
    expense,
    adjustment,
    balance: income - expense + adjustment,
    pendingWithdrawals,
    activeHouses,
    activeBoxes
  };
}

export async function listFinanceTransactions() {
  const transactions = await prisma.cashTransaction.findMany({
    orderBy: { transactionAt: "desc" },
    include: transactionInclude
  });

  return transactions.map(serializeCashTransaction);
}

export async function createExpense(input: CreateExpenseInput, actorId: number, ipAddress?: string | null) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.financialCategory.findFirst({
      where: { id: input.categoryId, deletedAt: null, type: "EXPENSE" }
    });
    if (!category) throw new BusinessRuleError("INVALID_CATEGORY", "Kategori pengeluaran tidak valid.");

    const transaction = await tx.cashTransaction.create({
      data: {
        categoryId: category.id,
        type: "EXPENSE",
        status: "VALIDATED",
        referenceType: "EXPENSE",
        amount: input.amount,
        description: input.description,
        reason: input.reason,
        transactionAt: input.transactionAt,
        validatedAt: new Date(),
        createdById: actorId,
        validatedById: actorId
      },
      include: transactionInclude
    });

    const updated = await tx.cashTransaction.update({
      where: { id: transaction.id },
      data: { referenceId: transaction.id },
      include: transactionInclude
    });

    await createAuditLog({
      tx,
      actorId,
      action: "finance.expense.create",
      entityType: "CashTransaction",
      entityId: transaction.id,
      ipAddress,
      metadata: auditMetadata({
        after: serializeCashTransaction(updated),
        reason: input.reason
      })
    });

    return updated;
  });
}

export async function createAdjustment(input: CreateAdjustmentInput, actorId: number, ipAddress?: string | null) {
  if (!input.approved) {
    throw new BusinessRuleError("APPROVAL_REQUIRED", "Adjustment wajib disetujui.");
  }

  return prisma.$transaction(async (tx) => {
    const category = await tx.financialCategory.findFirst({
      where: { id: input.categoryId, deletedAt: null, type: "ADJUSTMENT" }
    });
    if (!category) throw new BusinessRuleError("INVALID_CATEGORY", "Kategori adjustment tidak valid.");

    const transaction = await tx.cashTransaction.create({
      data: {
        categoryId: category.id,
        type: "ADJUSTMENT",
        status: "VALIDATED",
        referenceType: "ADJUSTMENT",
        amount: input.amount,
        description: input.description,
        reason: input.reason,
        transactionAt: input.transactionAt,
        validatedAt: new Date(),
        createdById: actorId,
        validatedById: actorId
      },
      include: transactionInclude
    });

    const updated = await tx.cashTransaction.update({
      where: { id: transaction.id },
      data: { referenceId: transaction.id },
      include: transactionInclude
    });

    await createAuditLog({
      tx,
      actorId,
      action: "finance.adjustment.create",
      entityType: "CashTransaction",
      entityId: transaction.id,
      ipAddress,
      metadata: auditMetadata({
        after: serializeCashTransaction(updated),
        reason: input.reason
      })
    });

    return updated;
  });
}

export function serializeCashTransaction(
  transaction: Prisma.CashTransactionGetPayload<{ include: typeof transactionInclude }>
) {
  return {
    id: transaction.id,
    categoryId: transaction.categoryId,
    categoryName: transaction.category.name,
    withdrawalId: transaction.withdrawalId,
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    type: transaction.type,
    status: transaction.status,
    amount: transaction.amount,
    description: transaction.description,
    reason: transaction.reason ?? "",
    transactionAt: transaction.transactionAt.toISOString(),
    validatedAt: transaction.validatedAt?.toISOString() ?? null,
    createdBy: transaction.createdBy?.name ?? null,
    validatedBy: transaction.validatedBy?.name ?? null,
    source: transaction.withdrawal
      ? {
          houseName: transaction.withdrawal.house.headOfFamily,
          boxNumber: transaction.withdrawal.coinBox.boxNumber
        }
      : null
  };
}
