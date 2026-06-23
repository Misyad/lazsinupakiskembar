import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Coins, FileText, HandCoins, Landmark, MapPin, Phone, UsersRound } from "lucide-react";
import {
  getDocumentation,
  getIncomeTrend,
  getPrograms,
  getPublicReports,
  getPublicStats,
  type PublicStat
} from "@/src/services/public/service";

const STAT_ICONS = {
  coins: Coins,
  handCoins: HandCoins,
  landmark: Landmark,
  users: UsersRound
} as const;

// Static accent -> Tailwind classes (dynamic class strings can't be purged safely).
const DOC_ACCENTS: Record<string, string> = {
  emerald: "bg-emerald-100",
  amber: "bg-amber-100",
  sky: "bg-sky-100",
  rose: "bg-rose-100",
  violet: "bg-violet-100"
};

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand-700 text-white">
            <Coins size={21} />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-700">KOIN NU</p>
            <p className="text-xs text-slate-500">Ranting Pakiskembar</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link className="hover:text-brand-700" href="/transparansi">Transparansi</Link>
          <Link className="hover:text-brand-700" href="/laporan/mei-2026">Laporan</Link>
          <Link className="hover:text-brand-700" href="/tentang">Tentang</Link>
          <Link className="hover:text-brand-700" href="/dokumentasi">Dokumentasi</Link>
        </nav>
        <Link className="rounded-[8px] bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600" href="/login">
          Login Pengurus
        </Link>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold text-emerald-200">LAZISNU Ranting Pakiskembar</p>
          <h2 className="mt-2 text-2xl font-semibold">Gerakan KOIN NU Ranting Pakiskembar</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Portal publik transparansi pengelolaan dana umat untuk mendukung program sosial,
            pendidikan, kesehatan, dan kemaslahatan warga.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-slate-300">
          <p className="flex gap-2"><MapPin size={18} className="text-emerald-300" />Sekretariat LAZISNU Ranting Pakiskembar, Pakis, Malang</p>
          <p className="flex gap-2"><Phone size={18} className="text-emerald-300" />0812-3456-7890</p>
          <p className="flex gap-2"><Building2 size={18} className="text-emerald-300" />NU Care-LAZISNU Ranting Pakiskembar</p>
        </div>
      </div>
    </footer>
  );
}

export async function PublicSummaryPage({ title, description }: { title: string; description: string }) {
  const stats = await getPublicStats();
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">Portal Publik</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {stats.map((item) => (
          <PublicStatCard key={item.label} {...item} />
        ))}
      </section>
    </main>
  );
}

export function PublicStatCard({ label, value, icon }: PublicStat) {
  const Icon = STAT_ICONS[icon];
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[8px] bg-emerald-50 text-brand-700">
        <Icon size={22} />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

/** 4 statistic cards, fetched from the ledger. */
export async function PublicStatsGrid() {
  const stats = await getPublicStats();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <PublicStatCard key={item.label} {...item} />
      ))}
    </div>
  );
}

/** Hero summary box (top 3 figures). */
export async function HeroSummaryCard() {
  const stats = await getPublicStats();
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-brand-700">Ringkasan Terkini</p>
      <div className="mt-5 grid gap-4">
        {stats.slice(0, 3).map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-[8px] bg-slate-50 p-4">
            <span className="text-sm text-slate-600">{item.label}</span>
            <span className="font-semibold text-ink">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[8px] bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Laporan publik menampilkan agregat dana dan program. Data pribadi donatur
        tetap berada di area internal pengurus.
      </div>
    </div>
  );
}

export async function IncomeChart() {
  const data = await getIncomeTrend();
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-700">Grafik Pemasukan</p>
          <h2 className="text-2xl font-semibold text-ink">Tren pemasukan bulanan</h2>
        </div>
        <CalendarDays className="text-amber-500" size={24} />
      </div>
      <div className="flex h-72 items-end gap-3">
        {data.map((item) => (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-3" title={item.amount}>
            <div className="w-full rounded-t-[8px] bg-gradient-to-t from-brand-700 to-emerald-400" style={{ height: `${item.value}%` }} />
            <span className="text-xs font-medium text-slate-500">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Program Berjalan" panel. */
export async function ProgramsPanel() {
  const programs = await getPrograms();
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-brand-700">Program Berjalan</p>
      <h2 className="mt-1 text-2xl font-semibold text-ink">Penyaluran sosial aktif</h2>
      <div className="mt-6 grid gap-3">
        {programs.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada program aktif.</p>
        ) : (
          programs.map((program) => (
            <article key={program.title} className="rounded-[8px] border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-ink">{program.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">Alokasi berjalan: {program.amount}</p>
                </div>
                <span className="rounded-[6px] bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  {program.status}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export async function PublicReportTable() {
  const rows = await getPublicReports();
  return (
    <div className="overflow-x-auto rounded-[8px] border border-slate-200 bg-white shadow-soft">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {["Periode", "Keterangan", "Nominal", "Status"].map((header) => (
              <th key={header} className="px-4 py-3 font-semibold text-slate-600">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.period} className="border-t border-slate-100">
              <td className="px-4 py-4 text-slate-700">{row.period}</td>
              <td className="px-4 py-4 text-slate-700">{row.description}</td>
              <td className="px-4 py-4 text-slate-700">{row.amount}</td>
              <td className="px-4 py-4 font-semibold text-brand-700">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function DocumentationGrid() {
  const items = await getDocumentation();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada dokumentasi.</p>
      ) : (
        items.map((item) => (
          <div key={item.title} className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-soft">
            <div className={`h-44 ${DOC_ACCENTS[item.accent] ?? DOC_ACCENTS.emerald} p-5`}>
              <FileText className="text-slate-700" size={32} />
            </div>
            <div className="p-4">
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function HeroCta() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-brand-700 px-5 font-semibold text-white hover:bg-brand-600" href="/transparansi">
        Lihat Transparansi
        <ArrowRight size={18} />
      </Link>
      <Link className="inline-flex h-12 items-center justify-center rounded-[8px] border border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700" href="/login">
        Login Pengurus
      </Link>
    </div>
  );
}
