import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DataProvider } from "@/components/DataProvider";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "next-auth/react";

const inter = localFont({
  src: "../../public/fonts/Inter-Variable.ttf",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SAKUKU - Pencatat Pengeluaran",
  description: "Aplikasi pencatat pengeluaran bulanan, ringan dan offline-first",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#006E08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <DataProvider>
            <Sidebar />
            <div className="md:pl-60">
              <div className="max-w-md md:max-w-4xl mx-auto relative">{children}</div>
            </div>
          </DataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
