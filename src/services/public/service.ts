import { prisma } from "@/src/lib/db/prisma";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];
const monthNamesLong = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function rupiah(value: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
}

export type PublicStat = {
  label: string;
  value: string;
  icon: "coins" | "handCoins" | "landmark" | "users";
};

/**
 * Aggregate financial figures for the public landing/transparency pages.
 * Only VALIDATED cash transactions count toward the public totals.
 */
export async function getPublicStats(): Promise<PublicStat[]> {
  const [income, expense, adjustment, houses] = await Promise.all([
    prisma.cashTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME", status: "VALIDATED" }
    }),
    prisma.cashTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "EXPENSE", status: "VALIDATED" }
    }),
    prisma.cashTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "ADJUSTMENT", status: "VALIDATED" }
    }),
    prisma.house.count({ where: { status: "aktif", deletedAt: null } })
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;
  const totalAdjustment = adjustment._sum.amount ?? 0;
  const balance = totalIncome - totalExpense + totalAdjustment;

  return [
    { label: "Total Dana Terkumpul", value: rupiah(totalIncome), icon: "coins" },
    { label: "Total Dana Tersalurkan", value: rupiah(totalExpense), icon: "handCoins" },
    { label: "Saldo Aktif", value: rupiah(balance), icon: "landmark" },
    { label: "Jumlah Rumah Donatur", value: new Intl.NumberFormat("id-ID").format(houses), icon: "users" }
  ];
}

export type IncomePoint = { month: string; value: number; amount: string };

/**
 * Monthly validated income for the last `monthsBack` months.
 * `value` is a 0-100 height percentage for the bar chart; `amount` is the formatted rupiah.
 */
export async function getIncomeTrend(monthsBack = 6): Promise<IncomePoint[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const txs = await prisma.cashTransaction.findMany({
    where: {
      type: "INCOME",
      status: "VALIDATED",
      transactionAt: { gte: start }
    },
    select: { amount: true, transactionAt: true }
  });

  const buckets = Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1) + i, 1);
    return { year: d.getFullYear(), monthIndex: d.getMonth(), total: 0 };
  });

  for (const t of txs) {
    const d = new Date(t.transactionAt);
    const bucket = buckets.find((b) => b.year === d.getFullYear() && b.monthIndex === d.getMonth());
    if (bucket) bucket.total += t.amount;
  }

  const max = Math.max(1, ...buckets.map((b) => b.total));

  return buckets.map((b) => ({
    month: monthNames[b.monthIndex],
    value: Math.round((b.total / max) * 100),
    amount: rupiah(b.total)
  }));
}

export type PublicReportRow = {
  period: string;
  description: string;
  amount: string;
  status: string;
};

/**
 * Recent monthly public report rows generated from real validated income.
 * Computed live (not seeded) so figures always match the ledger.
 */
export async function getPublicReports(months = 3): Promise<PublicReportRow[]> {
  const now = new Date();

  const rows = await Promise.all(
    Array.from({ length: months }, async (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const agg = await prisma.cashTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "INCOME",
          status: "VALIDATED",
          transactionAt: { gte: start, lte: end }
        }
      });

      return {
        period: `${monthNamesLong[d.getMonth()]} ${d.getFullYear()}`,
        description: "Pemasukan rutin KOIN NU",
        amount: rupiah(agg._sum.amount ?? 0),
        status: "Terverifikasi"
      };
    })
  );

  return rows;
}

export type ProgramItem = { title: string; amount: string; status: string };

export async function getPrograms(): Promise<ProgramItem[]> {
  const rows = await prisma.program.findMany({
    where: { active: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
  });
  return rows.map((p) => ({ title: p.title, amount: rupiah(p.amount), status: p.status }));
}

export type DocItem = { title: string; description: string; accent: string; imageUrl: string | null };

export async function getDocumentation(): Promise<DocItem[]> {
  const rows = await prisma.documentation.findMany({
    where: { active: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
  });
  return rows.map((d) => ({
    title: d.title,
    description: d.description,
    accent: d.accent,
    imageUrl: d.imageId ? `/api/media/${d.imageId}` : null
  }));
}
