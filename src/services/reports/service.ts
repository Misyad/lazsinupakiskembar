import { prisma } from "@/src/lib/db/prisma";
import type { CashTransactionType, WithdrawalStatus } from "@prisma/client";

export type ReportPeriod = {
  year: number;
  month: number;
};

export type ReportSummary = {
  period: string;
  periodLabel: string;
  totalIncome: number;
  totalExpense: number;
  totalAdjustment: number;
  balance: number;
  totalWithdrawals: number;
  validatedWithdrawals: number;
  pendingWithdrawals: number;
  rejectedWithdrawals: number;
  activeHouses: number;
  activeBoxes: number;
};

export type WithdrawalReport = {
  id: number;
  boxNumber: string;
  houseName: string;
  houseAddress: string;
  amount: number;
  collectorName: string;
  collectedAt: Date;
  status: WithdrawalStatus;
  validatedAt: Date | null;
  notes: string | null;
};

export type TransactionReport = {
  id: number;
  date: Date;
  type: CashTransactionType;
  categoryName: string;
  description: string;
  amount: number;
  status: string;
  createdByName: string | null;
};

export async function generateReportData(period: ReportPeriod) {
  const startDate = new Date(period.year, period.month - 1, 1);
  const endDate = new Date(period.year, period.month, 0, 23, 59, 59);

  const [withdrawals, transactions, activeHousesCount, activeBoxesCount] = await Promise.all([
    prisma.withdrawal.findMany({
      where: {
        collectedAt: { gte: startDate, lte: endDate }
      },
      include: {
        coinBox: true,
        house: true,
        collector: true
      },
      orderBy: { collectedAt: "desc" }
    }),
    prisma.cashTransaction.findMany({
      where: {
        transactionAt: { gte: startDate, lte: endDate }
      },
      include: {
        category: true,
        createdBy: true
      },
      orderBy: { transactionAt: "desc" }
    }),
    prisma.house.count({
      where: { status: "aktif", deletedAt: null }
    }),
    prisma.coinBox.count({
      where: { status: "ACTIVE", deletedAt: null }
    })
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME" && t.status === "VALIDATED")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE" && t.status === "VALIDATED")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAdjustment = transactions
    .filter((t) => t.type === "ADJUSTMENT" && t.status === "VALIDATED")
    .reduce((sum, t) => sum + t.amount, 0);

  const validatedWithdrawals = withdrawals.filter((w) => w.status === "VALIDATED").length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "PENDING").length;
  const rejectedWithdrawals = withdrawals.filter((w) => w.status === "REJECTED").length;

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const periodLabel = `${monthNames[period.month - 1]} ${period.year}`;

  const summary: ReportSummary = {
    period: `${period.year}-${String(period.month).padStart(2, "0")}`,
    periodLabel,
    totalIncome,
    totalExpense,
    totalAdjustment,
    balance: totalIncome - totalExpense + totalAdjustment,
    totalWithdrawals: withdrawals.length,
    validatedWithdrawals,
    pendingWithdrawals,
    rejectedWithdrawals,
    activeHouses: activeHousesCount,
    activeBoxes: activeBoxesCount
  };

  const withdrawalReports: WithdrawalReport[] = withdrawals.map((w) => ({
    id: w.id,
    boxNumber: w.coinBox.boxNumber,
    houseName: w.house.headOfFamily,
    houseAddress: w.house.address,
    amount: w.amount,
    collectorName: w.collector.name,
    collectedAt: w.collectedAt,
    status: w.status,
    validatedAt: w.validatedAt,
    notes: w.notes
  }));

  const transactionReports: TransactionReport[] = transactions.map((t) => ({
    id: t.id,
    date: t.transactionAt,
    type: t.type,
    categoryName: t.category.name,
    description: t.description,
    amount: t.amount,
    status: t.status,
    createdByName: t.createdBy?.name ?? null
  }));

  return {
    summary,
    withdrawals: withdrawalReports,
    transactions: transactionReports
  };
}

export function parsePeriod(periodStr: string): ReportPeriod | null {
  const match = /^(\d{4})-(\d{2})$/.exec(periodStr);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) return null;
  return { year, month };
}
