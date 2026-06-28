"use client";

import { X } from "lucide-react";

interface Props {
  dusunList: string[];
  rtList: string[];
  rwList: string[];
  filters: { dusun: string; rt: string; rw: string; status: string };
  onChange: (filters: any) => void;
  onClose: () => void;
}

const statuses = [
  { value: "", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "unassigned", label: "Belum Diambil" },
  { value: "inactive", label: "Nonaktif" },
];

export function MapFilter({ dusunList, rtList, rwList, filters, onChange, onClose }: Props) {
  const update = (key: string, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="absolute top-0 left-0 z-20 h-full w-72 bg-white border-r border-slate-200 shadow-lg overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-sm">Filter</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase mb-1.5 block">Dusun</label>
          <select
            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={filters.dusun}
            onChange={(e) => update("dusun", e.target.value)}
          >
            <option value="">Semua Dusun</option>
            {dusunList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase mb-1.5 block">RT</label>
          <select
            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={filters.rt}
            onChange={(e) => update("rt", e.target.value)}
          >
            <option value="">Semua RT</option>
            {rtList.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase mb-1.5 block">RW</label>
          <select
            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={filters.rw}
            onChange={(e) => update("rw", e.target.value)}
          >
            <option value="">Semua RW</option>
            {rwList.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase mb-1.5 block">Status</label>
          <div className="space-y-1">
            {statuses.map((s) => (
              <label key={s.value} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={filters.status === s.value}
                  onChange={(e) => update("status", e.target.value)}
                  className="text-brand-600"
                />
                <span className="text-sm">{s.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
