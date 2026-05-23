import type { Metadata } from "next";
import "./globals.css";

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
