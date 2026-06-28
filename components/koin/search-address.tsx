"use client";

import { useState, useCallback, useRef } from "react";

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

interface Props {
  onSelect: (lat: number, lng: number, label: string) => void;
}

export function SearchAddress({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);
    if (q.length < 3) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}&countrycodes=id`
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  return (
    <div className="relative">
      <label className="text-sm font-medium text-slate-700 mb-1 block">Cari alamat</label>
      <input
        className="h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm"
        placeholder="Masukkan alamat atau nama tempat..."
        value={query}
        onChange={(e) => search(e.target.value)}
      />
      {loading && <p className="text-xs text-slate-400 mt-1">Mencari...</p>}
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-[8px] border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-brand-50 border-b border-slate-100 last:border-0 transition-colors"
              onClick={() => {
                onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                setQuery(r.display_name.split(",")[0]);
                setOpen(false);
                setResults([]);
              }}
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
