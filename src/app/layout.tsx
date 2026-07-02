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
  description: "Aplikasi pencatat pengeluaran bulanan, ringan dan offline-first",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#006E08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <html lang="id" className="h-full">
      <body className={`${inter.variable} font-sans antialiased min-h-screen h-full bg-surface text-on-surface`}>
        <SessionProvider>
          <DataProvider>
            {isAuthenticated && <Sidebar />}
            <div className={isAuthenticated ? "md:pl-60" : ""}>
              <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-0 sm:px-4 md:px-6 lg:px-8">
                <div className="relative flex-1">{children}</div>
              </div>
            </div>
          </DataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
