import PDFDocument from "pdfkit";
import type { ReportSummary, WithdrawalReport, TransactionReport } from "@/src/services/reports/service";

export async function generatePdfReport(
  summary: ReportSummary,
  withdrawals: WithdrawalReport[],
  transactions: TransactionReport[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(18).font("Helvetica-Bold").text("LAPORAN KOIN NU", { align: "center" });
    doc.fontSize(14).font("Helvetica").text("LAZISNU Pakiskembar", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Periode: ${summary.periodLabel}`, { align: "center" });
    doc.moveDown(1.5);

    // Ringkasan Keuangan
    doc.fontSize(14).font("Helvetica-Bold").text("RINGKASAN KEUANGAN");
    doc.moveDown(0.5);
    
    const summaryData = [
      ["Kas Masuk (Tervalidasi)", formatCurrency(summary.totalIncome)],
      ["Kas Keluar", formatCurrency(summary.totalExpense)],
      ["Penyesuaian", formatCurrency(summary.totalAdjustment)],
      ["Saldo Akhir", formatCurrency(summary.balance)]
    ];

    const tableTop = doc.y;
    summaryData.forEach((row, i) => {
      const y = tableTop + i * 20;
      doc.fontSize(10).font("Helvetica").text(row[0], 50, y, { width: 250 });
      doc.fontSize(10).font("Helvetica-Bold").text(row[1], 300, y, { width: 250, align: "right" });
    });

    doc.moveDown(3);

    // Statistik Penarikan
    doc.fontSize(14).font("Helvetica-Bold").text("STATISTIK PENARIKAN");
    doc.moveDown(0.5);

    const statsData = [
      ["Total Penarikan", summary.totalWithdrawals.toString()],
      ["Tervalidasi", summary.validatedWithdrawals.toString()],
      ["Pending", summary.pendingWithdrawals.toString()],
      ["Ditolak", summary.rejectedWithdrawals.toString()]
    ];

    const statsTop = doc.y;
    statsData.forEach((row, i) => {
      const y = statsTop + i * 20;
      doc.fontSize(10).font("Helvetica").text(row[0], 50, y, { width: 250 });
      doc.fontSize(10).font("Helvetica-Bold").text(row[1], 300, y, { width: 250, align: "right" });
    });

    doc.moveDown(2);

    // Data Operasional
    doc.fontSize(10).font("Helvetica").text(`Rumah Aktif: ${summary.activeHouses}`, 50, doc.y);
    doc.fontSize(10).text(`Kaleng Aktif: ${summary.activeBoxes}`, 300, doc.y - 12, { align: "right" });
    doc.moveDown(2);

    // Tabel Penarikan (halaman baru jika perlu)
    if (doc.y > 650) doc.addPage();
    
    doc.fontSize(14).font("Helvetica-Bold").text("RINCIAN PENARIKAN");
    doc.moveDown(0.5);

    const withdrawalHeaders = ["No", "Kaleng", "Rumah", "Nominal", "Status"];
    const colWidths = [30, 100, 150, 100, 115];
    let tableY = doc.y;

    // Header tabel
    doc.fontSize(9).font("Helvetica-Bold");
    withdrawalHeaders.forEach((header, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, tableY, { width: colWidths[i] });
    });

    tableY += 15;
    doc.moveTo(50, tableY).lineTo(545, tableY).stroke();
    tableY += 5;

    // Data penarikan (maksimal 20 baris per halaman)
    doc.fontSize(8).font("Helvetica");
    withdrawals.slice(0, 30).forEach((w, idx) => {
      if (tableY > 720) {
        doc.addPage();
        tableY = 50;
      }

      const rowData = [
        (idx + 1).toString(),
        w.boxNumber,
        w.houseName.substring(0, 25),
        formatCurrency(w.amount),
        formatStatus(w.status)
      ];

      rowData.forEach((cell, i) => {
        const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(cell, x, tableY, { width: colWidths[i] });
      });

      tableY += 18;
    });

    if (withdrawals.length > 30) {
      doc.fontSize(8).font("Helvetica-Oblique").text(`... dan ${withdrawals.length - 30} penarikan lainnya`, 50, tableY);
      tableY += 20;
    }

    // Tabel Transaksi (halaman baru)
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("RINCIAN TRANSAKSI KAS");
    doc.moveDown(0.5);

    const txHeaders = ["Tgl", "Jenis", "Kategori", "Nominal"];
    const txColWidths = [80, 80, 180, 100];
    let txTableY = doc.y;

    // Header tabel
    doc.fontSize(9).font("Helvetica-Bold");
    txHeaders.forEach((header, i) => {
      const x = 50 + txColWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, txTableY, { width: txColWidths[i] });
    });

    txTableY += 15;
    doc.moveTo(50, txTableY).lineTo(545, txTableY).stroke();
    txTableY += 5;

    // Data transaksi (maksimal 30 baris)
    doc.fontSize(8).font("Helvetica");
    transactions.slice(0, 30).forEach((t) => {
      if (txTableY > 720) {
        doc.addPage();
        txTableY = 50;
      }

      const txRowData = [
        formatDateShort(t.date),
        formatTxType(t.type),
        t.categoryName.substring(0, 30),
        formatCurrency(t.amount)
      ];

      txRowData.forEach((cell, i) => {
        const x = 50 + txColWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(cell, x, txTableY, { width: txColWidths[i] });
      });

      txTableY += 18;
    });

    if (transactions.length > 30) {
      doc.fontSize(8).font("Helvetica-Oblique").text(`... dan ${transactions.length - 30} transaksi lainnya`, 50, txTableY);
    }

    // Footer & Tanda Tangan
    doc.addPage();
    doc.moveDown(2);
    doc.fontSize(10).font("Helvetica").text("Demikian laporan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.", 50, doc.y);
    doc.moveDown(3);

    const signatureY = doc.y;
    doc.fontSize(10).font("Helvetica").text("Mengetahui,", 50, signatureY);
    doc.text("Bendahara,", 350, signatureY);
    doc.moveDown(4);
    doc.text("(_________________)", 50, doc.y);
    doc.text("(_________________)", 350, doc.y - 12);

    doc.moveDown(2);
    doc.fontSize(8).font("Helvetica-Oblique").text(`Dicetak: ${formatDateFull(new Date())}`, 50, doc.y, { align: "center" });

    doc.end();
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Pending",
    VALIDATED: "Valid",
    REJECTED: "Tolak",
    VOIDED: "Batal"
  };
  return map[status] || status;
}

function formatTxType(type: string): string {
  const map: Record<string, string> = {
    INCOME: "Masuk",
    EXPENSE: "Keluar",
    ADJUSTMENT: "Adjust"
  };
  return map[type] || type;
}
