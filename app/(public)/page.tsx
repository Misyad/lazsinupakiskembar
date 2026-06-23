import { DocumentationGrid, HeroCta, HeroSummaryCard, IncomeChart, ProgramsPanel, PublicReportTable, PublicStatsGrid } from "@/components/public-site";

// Render on request (reads live DB data); skip build-time static prerender.
export const dynamic = "force-dynamic";

export default function PublicHomePage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f7faf7_0%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">Portal Resmi Transparansi</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-6xl">
              Gerakan KOIN NU Ranting Pakiskembar
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Transparansi pengelolaan dana umat untuk mendukung penyaluran sosial,
              pendidikan, kesehatan, dan program kemaslahatan warga Pakiskembar.
            </p>
            <div className="mt-8">
              <HeroCta />
            </div>
          </div>
          <HeroSummaryCard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PublicStatsGrid />
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <IncomeChart />
          <ProgramsPanel />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-700">Dokumentasi Kegiatan</p>
          <h2 className="mt-1 text-3xl font-semibold text-ink">Kegiatan LAZISNU Pakiskembar</h2>
        </div>
        <DocumentationGrid />
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-brand-700">Transparansi Ringkas</p>
              <h2 className="mt-1 text-3xl font-semibold text-ink">Laporan publik terbaru</h2>
            </div>
          </div>
          <PublicReportTable />
        </div>
      </section>
    </main>
  );
}
