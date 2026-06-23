import ExcelJS from "exceljs";
import type { ReportSummary, WithdrawalReport, TransactionReport } from "@/src/services/reports/service";

export async function generateExcelReport(
  summary: ReportSummary,
  withdrawals: WithdrawalReport[],
  transactions: TransactionReport[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LAZISNU Pakiskembar";
  workbook.created = new Date();

  // Sheet 1: Ringkasan
  const summarySheet = workbook.addWorksheet("Ringkasan");
  summarySheet.columns = [
    { key: "label", width: 30 },
    { key: "value", width: 20 }
  ];

  summarySheet.addRow({ label: "LAPORAN KOIN NU", value: "" });
  summarySheet.addRow({ label: "Periode", value: summary.periodLabel });
  summarySheet.addRow({ label: "", value: "" });
  summarySheet.addRow({ label: "RINGKASAN KEUANGAN", value: "" });
  summarySheet.addRow({ label: "Kas Masuk (Tervalidasi)", value: formatCurrency(summary.totalIncome) });
  summarySheet.addRow({ label: "Kas Keluar", value: formatCurrency(summary.totalExpense) });
  summarySheet.addRow({ label: "Penyesuaian", value: formatCurrency(summary.totalAdjustment) });
  summarySheet.addRow({ label: "Saldo Akhir", value: formatCurrency(summary.balance) });
  summarySheet.addRow({ label: "", value: "" });
  summarySheet.addRow({ label: "STATISTIK PENARIKAN", value: "" });
  summarySheet.addRow({ label: "Total Penarikan", value: summary.totalWithdrawals });
  summarySheet.addRow({ label: "Tervalidasi", value: summary.validatedWithdrawals });
  summarySheet.addRow({ label: "Pending", value: summary.pendingWithdrawals });
  summarySheet.addRow({ label: "Ditolak", value: summary.rejectedWithdrawals });
  summarySheet.addRow({ label: "", value: "" });
  summarySheet.addRow({ label: "DATA OPERASIONAL", value: "" });
  summarySheet.addRow({ label: "Rumah Aktif", value: summary.activeHouses });
  summarySheet.addRow({ label: "Kaleng Aktif", value: summary.activeBoxes });

  summarySheet.getCell("A1").font = { bold: true, size: 14 };
  summarySheet.getCell("A4").font = { bold: true };
  summarySheet.getCell("A10").font = { bold: true };
  summarySheet.getCell("A16").font = { bold: true };

  // Sheet 2: Penarikan
  const withdrawalSheet = workbook.addWorksheet("Penarikan");
  withdrawalSheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Nomor Kaleng", key: "boxNumber", width: 18 },
    { header: "Nama Rumah", key: "houseName", width: 25 },
    { header: "Alamat", key: "address", width: 30 },
    { header: "Nominal", key: "amount", width: 15 },
    { header: "Petugas", key: "collector", width: 20 },
    { header: "Tanggal Tarik", key: "collectedAt", width: 18 },
    { header: "Status", key: "status", width: 12 },
    { header: "Validasi", key: "validatedAt", width: 18 },
    { header: "Catatan", key: "notes", width: 30 }
  ];

  const headerRow = withdrawalSheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" }
  };

  withdrawals.forEach((w) => {
    withdrawalSheet.addRow({
      id: w.id,
      boxNumber: w.boxNumber,
      houseName: w.houseName,
      address: w.houseAddress,
      amount: formatCurrency(w.amount),
      collector: w.collectorName,
      collectedAt: formatDate(w.collectedAt),
      status: formatStatus(w.status),
      validatedAt: w.validatedAt ? formatDate(w.validatedAt) : "-",
      notes: w.notes ?? "-"
    });
  });

  // Sheet 3: Transaksi Kas
  const transactionSheet = workbook.addWorksheet("Transaksi Kas");
  transactionSheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Tanggal", key: "date", width: 18 },
    { header: "Jenis", key: "type", width: 15 },
    { header: "Kategori", key: "category", width: 25 },
    { header: "Deskripsi", key: "description", width: 35 },
    { header: "Nominal", key: "amount", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Dibuat Oleh", key: "createdBy", width: 20 }
  ];

  const txHeaderRow = transactionSheet.getRow(1);
  txHeaderRow.font = { bold: true };
  txHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" }
  };

  transactions.forEach((t) => {
    transactionSheet.addRow({
      id: t.id,
      date: formatDate(t.date),
      type: formatTransactionType(t.type),
      category: t.categoryName,
      description: t.description,
      amount: formatCurrency(t.amount),
      status: t.status,
      createdBy: t.createdByName ?? "-"
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    VALIDATED: "Tervalidasi",
    REJECTED: "Ditolak",
    VOIDED: "Dibatalkan"
  };
  return statusMap[status] || status;
}

function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    INCOME: "Kas Masuk",
    EXPENSE: "Kas Keluar",
    ADJUSTMENT: "Penyesuaian"
  };
  return typeMap[type] || type;
}
