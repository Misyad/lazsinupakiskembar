import { DocumentationGrid, PublicSummaryPage } from "@/components/public-site";

// Render on request (reads live DB data); skip build-time static prerender.
export const dynamic = "force-dynamic";

export default function DokumentasiPage() {
  return (
    <>
      <PublicSummaryPage
        title="Dokumentasi Kegiatan"
        description="Arsip kegiatan penyaluran, musyawarah, dan program sosial LAZISNU Ranting Pakiskembar."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <DocumentationGrid />
      </section>
    </>
  );
}
