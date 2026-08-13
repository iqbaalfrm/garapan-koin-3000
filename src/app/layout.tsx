import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garapan Koin 3.000 - Catatan Transaksi Harian",
  description: "Aplikasi pencatatan transaksi harian dengan kalkulasi otomatis dan sistem sesi berbasis SQLite Turso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
