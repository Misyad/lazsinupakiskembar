"use client";

import type { HouseFeature } from "./map-view";

interface Props {
  houses: HouseFeature[];
  allHouses: HouseFeature[];
}

export function MapStats({ houses, allHouses }: Props) {
  const total = allHouses.length;
  const active = allHouses.filter((h) => h.status === "active").length;
  const unassigned = allHouses.filter((h) => h.status === "unassigned").length;
  const inactive = allHouses.filter((h) => h.status === "inactive").length;

  return (
    <div className="flex gap-4 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0 overflow-x-auto">
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="font-medium">{total}</span>
        <span className="text-slate-500">Total</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="font-medium">{active}</span>
        <span className="text-slate-500">Aktif</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
        <span className="font-medium">{unassigned}</span>
        <span className="text-slate-500">Belum Diambil</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
        <span className="font-medium">{inactive}</span>
        <span className="text-slate-500">Nonaktif</span>
      </div>
    </div>
  );
}
