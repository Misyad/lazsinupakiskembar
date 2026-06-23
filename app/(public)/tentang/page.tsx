import { PublicSummaryPage } from "@/components/public-site";

// Render on request (reads live DB data); skip build-time static prerender.
export const dynamic = "force-dynamic";

export default function TentangPage() {
  return (
    <PublicSummaryPage
      title="Tentang Gerakan KOIN NU Pakiskembar"
      description="KOIN NU Ranting Pakiskembar adalah gerakan penghimpunan koin warga untuk menopang program sosial, pendidikan, kesehatan, dan kemaslahatan umat secara transparan."
    />
  );
}
