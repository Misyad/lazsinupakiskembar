import { IncomeChart, PublicReportTable, PublicSummaryPage } from "@/components/public-site";

// Render on request (reads live DB data); skip build-time static prerender.
export const dynamic = "force-dynamic";

export default function TransparansiPage() {
  return (
    <>
      <PublicSummaryPage
        title="Transparansi Dana KOIN NU"
        description="Ringkasan publik pemasukan, penyaluran, saldo, dan status laporan KOIN NU Ranting Pakiskembar."
      />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:px-8">
        <IncomeChart />
        <PublicReportTable />
      </section>
    </>
  );
}
