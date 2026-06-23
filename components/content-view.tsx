"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";

type Program = {
  id: number;
  title: string;
  amount: number;
  status: string;
  sortOrder: number;
  active: boolean;
};

type Documentation = {
  id: number;
  title: string;
  description: string;
  accent: string;
  imageId: number | null;
  sortOrder: number;
  active: boolean;
};

type DocForm = { title: string; description: string; accent: string; imageId: number | null; sortOrder: number };

const ACCENTS = ["emerald", "amber", "sky", "rose", "violet"];
const rupiah = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

const emptyProgram = { title: "", amount: 0, status: "Berjalan", sortOrder: 0 };
const emptyDoc: DocForm = { title: "", description: "", accent: "emerald", imageId: null, sortOrder: 0 };

export function ContentView() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [programForm, setProgramForm] = useState({ ...emptyProgram });
  const [programEditId, setProgramEditId] = useState<number | null>(null);

  const [docForm, setDocForm] = useState<DocForm>({ ...emptyDoc });
  const [docEditId, setDocEditId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [pRes, dRes] = await Promise.all([
          fetch("/api/programs", { cache: "no-store" }),
          fetch("/api/documentation", { cache: "no-store" })
        ]);
        if (!pRes.ok || !dRes.ok) throw new Error("Gagal mengambil data konten.");
        const [pPayload, dPayload] = await Promise.all([pRes.json(), dRes.json()]);
        if (!active) return;
        setPrograms(pPayload.programs ?? []);
        setDocs(dPayload.documentation ?? []);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Gagal mengambil data konten.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  /* ------------------------------ Programs ------------------------------ */

  async function submitProgram() {
    if (!programForm.title.trim()) {
      setError("Judul program wajib diisi.");
      return;
    }
    setError("");
    const isEdit = programEditId !== null;
    const res = await fetch(isEdit ? `/api/programs/${programEditId}` : "/api/programs", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: programForm.title.trim(),
        amount: Number(programForm.amount) || 0,
        status: programForm.status.trim() || "Berjalan",
        sortOrder: Number(programForm.sortOrder) || 0
      })
    });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? "Gagal menyimpan program.");
      return;
    }
    if (isEdit) {
      setPrograms((items) => items.map((p) => (p.id === programEditId ? payload.program : p)));
    } else {
      setPrograms((items) => [...items, payload.program]);
    }
    setProgramForm({ ...emptyProgram });
    setProgramEditId(null);
  }

  async function toggleProgram(p: Program) {
    setError("");
    const res = await fetch(`/api/programs/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !p.active })
    });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? "Gagal mengubah status.");
      return;
    }
    setPrograms((items) => items.map((x) => (x.id === p.id ? payload.program : x)));
  }

  async function removeProgram(id: number) {
    setError("");
    const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "Gagal menghapus program.");
      return;
    }
    setPrograms((items) => items.filter((x) => x.id !== id));
    if (programEditId === id) {
      setProgramEditId(null);
      setProgramForm({ ...emptyProgram });
    }
  }

  function editProgram(p: Program) {
    setProgramEditId(p.id);
    setProgramForm({ title: p.title, amount: p.amount, status: p.status, sortOrder: p.sortOrder });
  }

  /* ---------------------------- Documentation --------------------------- */

  async function uploadDocImage(file: File) {
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "Gagal mengunggah foto.");
        return;
      }
      setDocForm((f) => ({ ...f, imageId: payload.id }));
    } finally {
      setUploading(false);
    }
  }

  async function submitDoc() {
    if (!docForm.title.trim() || !docForm.description.trim()) {
      setError("Judul dan deskripsi dokumentasi wajib diisi.");
      return;
    }
    setError("");
    const isEdit = docEditId !== null;
    const res = await fetch(isEdit ? `/api/documentation/${docEditId}` : "/api/documentation", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: docForm.title.trim(),
        description: docForm.description.trim(),
        accent: docForm.accent,
        imageId: docForm.imageId,
        sortOrder: Number(docForm.sortOrder) || 0
      })
    });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? "Gagal menyimpan dokumentasi.");
      return;
    }
    if (isEdit) {
      setDocs((items) => items.map((d) => (d.id === docEditId ? payload.documentation : d)));
    } else {
      setDocs((items) => [...items, payload.documentation]);
    }
    setDocForm({ ...emptyDoc });
    setDocEditId(null);
  }

  async function toggleDoc(d: Documentation) {
    setError("");
    const res = await fetch(`/api/documentation/${d.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !d.active })
    });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? "Gagal mengubah status.");
      return;
    }
    setDocs((items) => items.map((x) => (x.id === d.id ? payload.documentation : x)));
  }

  async function removeDoc(id: number) {
    setError("");
    const res = await fetch(`/api/documentation/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "Gagal menghapus dokumentasi.");
      return;
    }
    setDocs((items) => items.filter((x) => x.id !== id));
    if (docEditId === id) {
      setDocEditId(null);
      setDocForm({ ...emptyDoc });
    }
  }

  function editDoc(d: Documentation) {
    setDocEditId(d.id);
    setDocForm({ title: d.title, description: d.description, accent: d.accent, imageId: d.imageId ?? null, sortOrder: d.sortOrder });
  }

  const inputClass =
    "w-full rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500";

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
          Memuat data konten...
        </div>
      ) : null}

      <p className="rounded-[8px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        Program dan Dokumentasi tampil di landing page publik. Tabel <b>Laporan Publik</b> tidak diatur di sini &mdash;
        angkanya otomatis dari data keuangan tervalidasi.
      </p>

      {/* Programs */}
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Program Berjalan</h3>
          <span className="text-sm text-slate-500">{programs.length} item</span>
        </div>

        <div className="mb-5 grid gap-3 rounded-[8px] bg-paper p-4 md:grid-cols-[2fr_1.2fr_1fr_0.7fr_auto]">
          <input
            className={inputClass}
            placeholder="Judul program"
            value={programForm.title}
            onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Nominal (Rp)"
            value={programForm.amount}
            onChange={(e) => setProgramForm({ ...programForm, amount: Number(e.target.value) })}
          />
          <input
            className={inputClass}
            placeholder="Status"
            value={programForm.status}
            onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Urutan"
            value={programForm.sortOrder}
            onChange={(e) => setProgramForm({ ...programForm, sortOrder: Number(e.target.value) })}
          />
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-1 rounded-[8px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              onClick={submitProgram}
            >
              {programEditId ? <Pencil size={15} /> : <Plus size={15} />}
              {programEditId ? "Simpan" : "Tambah"}
            </button>
            {programEditId ? (
              <button
                className="inline-flex items-center rounded-[8px] border border-slate-200 px-2 text-slate-500"
                onClick={() => {
                  setProgramEditId(null);
                  setProgramForm({ ...emptyProgram });
                }}
                aria-label="Batal edit"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          {programs.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada program.</p>
          ) : (
            programs.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-slate-200 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {p.title}{" "}
                    {!p.active ? (
                      <span className="ml-1 rounded-[6px] bg-slate-100 px-2 py-0.5 text-xs text-slate-500">nonaktif</span>
                    ) : null}
                  </p>
                  <p className="text-sm text-slate-500">
                    {rupiah(p.amount)} &middot; {p.status} &middot; urutan {p.sortOrder}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn label="Edit" onClick={() => editProgram(p)}>
                    <Pencil size={16} />
                  </IconBtn>
                  <IconBtn label={p.active ? "Nonaktifkan" : "Aktifkan"} onClick={() => toggleProgram(p)}>
                    {p.active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconBtn>
                  <IconBtn label="Hapus" danger onClick={() => removeProgram(p.id)}>
                    <Trash2 size={16} />
                  </IconBtn>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Documentation */}
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Dokumentasi Kegiatan</h3>
          <span className="text-sm text-slate-500">{docs.length} item</span>
        </div>

        <div className="mb-5 grid gap-3 rounded-[8px] bg-paper p-4 md:grid-cols-[1.5fr_2fr_1fr_0.7fr_auto]">
          <input
            className={inputClass}
            placeholder="Judul"
            value={docForm.title}
            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Deskripsi"
            value={docForm.description}
            onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
          />
          <select
            className={inputClass}
            value={docForm.accent}
            onChange={(e) => setDocForm({ ...docForm, accent: e.target.value })}
          >
            {ACCENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            type="number"
            placeholder="Urutan"
            value={docForm.sortOrder}
            onChange={(e) => setDocForm({ ...docForm, sortOrder: Number(e.target.value) })}
          />
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-1 rounded-[8px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              onClick={submitDoc}
            >
              {docEditId ? <Pencil size={15} /> : <Plus size={15} />}
              {docEditId ? "Simpan" : "Tambah"}
            </button>
            {docEditId ? (
              <button
                className="inline-flex items-center rounded-[8px] border border-slate-200 px-2 text-slate-500"
                onClick={() => {
                  setDocEditId(null);
                  setDocForm({ ...emptyDoc });
                }}
                aria-label="Batal edit"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[8px] bg-paper p-4">
          <span className="text-sm font-medium text-slate-600">Foto:</span>
          {docForm.imageId ? (
            <span className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/${docForm.imageId}`}
                alt="preview"
                className="h-14 w-20 rounded-[6px] border border-slate-200 object-cover"
              />
              <button
                className="rounded-[8px] border border-slate-200 px-2 py-1 text-sm text-red-600 hover:border-red-200"
                onClick={() => setDocForm((f) => ({ ...f, imageId: null }))}
              >
                Hapus foto
              </button>
            </span>
          ) : (
            <span className="text-sm text-slate-400">belum ada</span>
          )}
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <ImagePlus size={15} />
            {uploading ? "Mengunggah..." : docForm.imageId ? "Ganti foto" : "Unggah foto"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadDocImage(file);
                e.target.value = "";
              }}
            />
          </label>
          <span className="text-xs text-slate-400">PNG/JPG/WEBP/GIF, maks 2 MB</span>
        </div>

        <div className="grid gap-2">
          {docs.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada dokumentasi.</p>
          ) : (
            docs.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-slate-200 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {d.imageId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/media/${d.imageId}`}
                      alt={d.title}
                      className="h-12 w-16 shrink-0 rounded-[6px] border border-slate-200 object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {d.title}{" "}
                      {!d.active ? (
                        <span className="ml-1 rounded-[6px] bg-slate-100 px-2 py-0.5 text-xs text-slate-500">nonaktif</span>
                      ) : null}
                    </p>
                    <p className="text-sm text-slate-500">
                      {d.description} &middot; {d.accent} &middot; urutan {d.sortOrder}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn label="Edit" onClick={() => editDoc(d)}>
                    <Pencil size={16} />
                  </IconBtn>
                  <IconBtn label={d.active ? "Nonaktifkan" : "Aktifkan"} onClick={() => toggleDoc(d)}>
                    {d.active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconBtn>
                  <IconBtn label="Hapus" danger onClick={() => removeDoc(d.id)}>
                    <Trash2 size={16} />
                  </IconBtn>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-[8px] border border-slate-200 bg-white p-2 transition hover:bg-slate-50 ${
        danger ? "text-red-600 hover:border-red-200" : "text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
