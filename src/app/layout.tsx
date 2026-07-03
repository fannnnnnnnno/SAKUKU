import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DataProvider } from "@/components/DataProvider";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = localFont({
  src: "../../public/fonts/Inter-Variable.ttf",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SAKUKU - Pencatat Pengeluaran",
  description: "Aplikasi pencatat pengeluaran bulanan, ringan dan mudah dipakai",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#006E08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil session di server — ini yang bikin sidebar langsung tampil
  // tanpa perlu nunggu client-side session fetch
  const session = await auth();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Pass session awal dari server ke SessionProvider */}
        <SessionProvider session={session}>
          <DataProvider>
            {/* Sidebar render di server dengan session awal — tidak perlu tunggu client */}
            <Sidebar />
            <div className="md:pl-60">
              <div className="max-w-md md:max-w-4xl mx-auto relative">
                {children}
              </div>
            </div>
          </DataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
