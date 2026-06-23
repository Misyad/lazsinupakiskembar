import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth";
import { permissions } from "@/src/lib/permissions/permissions";
import { generateReportData, parsePeriod } from "@/src/services/reports/service";
import { generateExcelReport } from "@/src/lib/export/excel";

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
    const excelBuffer = await generateExcelReport(
      reportData.summary,
      reportData.withdrawals,
      reportData.transactions
    );

    const fileName = `Laporan-KOINNU-${periodStr}.xlsx`;

    // Convert Buffer to Uint8Array for Response body compatibility
    const uint8Array = new Uint8Array(excelBuffer);

    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": excelBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    return NextResponse.json(
      { error: "Gagal membuat laporan Excel. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
