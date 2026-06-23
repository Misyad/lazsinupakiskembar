"use client";

import { Download } from "lucide-react";
import { useState } from "react";

type DashboardStats = {
  activeHouses: number;
  activeBoxes: number;
  income: number;
  expense: number;
  adjustment: number;
  pending: number;
  balance: number;
};

type Withdrawal = {
  id: number;
  boxNumber: string;
  houseName: string;
  amount: number;
  collector: string;
  status: "PENDING" | "VALIDATED" | "REJECTED" | "VOIDED";
  notes: string;
  createdAt: string;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0
});

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-paper p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

export function ReportsView({ stats, withdrawals }: { stats: DashboardStats; withdrawals: Withdrawal[] }) {
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const handleExportPdf = () => {
    const period = getPeriodFromDates(startDate, endDate);
    if (!period) {
      alert("Silakan pilih tanggal yang valid untuk export");
      return;
    }
    window.open(`/api/reports/${period}/export-pdf`, "_blank");
    setExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    const period = getPeriodFromDates(startDate, endDate);
    if (!period) {
      alert("Silakan pilih tanggal yang valid untuk export");
      return;
    }
    window.open(`/api/reports/${period}/export-excel`, "_blank");
    setExportMenuOpen(false);
  };

  return (
    <div className="grid gap-6">
      <Panel title="Filter laporan">
        <div className="grid gap-3 md:grid-cols-[180px_180px_1fr_auto]">
          <input
            className="h-11 rounded-[8px] border border-slate-200 px-3"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            className="h-11 rounded-[8px] border border-slate-200 px-3"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <select className="h-11 rounded-[8px] border border-slate-200 px-3">
            <option>Semua wilayah</option>
            <option>RT01/RW02</option>
            <option>RT02/RW02</option>
          </select>
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-slate-200 px-4 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download size={18} />
              Export
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-12 z-10 w-40 rounded-[8px] border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={handleExportPdf}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50"
                >
                  <Download size={16} />
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50"
                >
                  <Download size={16} />
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </Panel>
      <Panel title="Ringkasan laporan">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Transaksi" value={String(withdrawals.length)} />
          <Metric label="Tervalidasi" value={String(withdrawals.filter((item) => item.status === "VALIDATED").length)} />
          <Metric label="Total resmi" value={currency.format(stats.income)} />
        </div>
      </Panel>
    </div>
  );
}

function getPeriodFromDates(startDate: string, endDate: string): string | null {
  try {
    const start = new Date(startDate);
    new Date(endDate); // validate endDate
    
    // Use the start date's year and month as the period
    const year = start.getFullYear();
    const month = start.getMonth() + 1;
    
    return `${year}-${String(month).padStart(2, "0")}`;
  } catch {
    return null;
  }
}
