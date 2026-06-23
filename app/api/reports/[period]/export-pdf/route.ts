import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth";
import { permissions } from "@/src/lib/permissions/permissions";
import { generateReportData, parsePeriod } from "@/src/services/reports/service";
import { generatePdfReport } from "@/src/lib/export/pdf";

type Params = {
  params: Promise<{ period: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { response } = await requireApiPermission(permissions.financeRead);
  if (response) return response;

  const { period: periodStr } = await params;
  const period = parsePeriod(periodStr);

  if (!period) {
    return NextResponse.json(
      { error: "Format periode tidak valid. Gunakan format YYYY-MM (contoh: 2026-05)" },
      { status: 400 }
    );
  }

  try {
    const reportData = await generateReportData(period);
    const pdfBuffer = await generatePdfReport(
      reportData.summary,
      reportData.withdrawals,
      reportData.transactions
    );

    const fileName = `Laporan-KOINNU-${periodStr}.pdf`;

    // Convert Buffer to Uint8Array for Response body compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json(
      { error: "Gagal membuat laporan PDF. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
