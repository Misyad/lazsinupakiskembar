import type { Metadata } from "next";
import "./globals.css";
// Leaflet CSS — required for map tiles to render correctly (especially Safari)
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "KOINNU Ranting System",
  description: "Sistem Informasi GERAKAN KOIN NU untuk Pengurus Ranting LAZISNU"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
