"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, ScanLine, PieChart, Settings, Wallet, Tag, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transaksi", label: "Transaksi", icon: Receipt },
  { href: "/scan", label: "Scan Struk", icon: ScanLine },
  { href: "/laporan", label: "Laporan", icon: PieChart },
  { href: "/kategori", label: "Kategori", icon: Tag },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  // Ambil session tapi JANGAN jadikan kondisi untuk render sidebar
  // Sidebar selalu tampil — session hanya untuk info user di bawah
  const { data: session, status } = useSession();

  // Sembunyikan sidebar di halaman auth
  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password");

  if (isAuthPage) return null;

  return (
    <aside className="hidden md:flex flex-col w-60 fixed left-0 top-0 h-screen bg-surface-lowest border-r border-surface-high px-4 py-6 z-30">
      {/* Logo — selalu tampil, tidak bergantung session */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Wallet size={18} color="white" />
        </div>
        <h1 className="text-lg font-bold text-primary">SAKUKU</h1>
      </div>

      {/* Nav Items — selalu tampil */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
          pathname === href ||
          (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        <Link
          href="/tambah"
          className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-full text-sm hover:bg-primary/90 transition-colors"
        >
          + Tambah Transaksi
        </Link>

        <div className="border-t border-surface-high pt-3">
          {/* Loading skeleton saat session belum siap */}
          {status === "loading" && (
            <div className="px-3 py-2 animate-pulse">
              <div className="h-3 bg-surface-container rounded w-3/4 mb-2" />
              <div className="h-2 bg-surface-container rounded w-full" />
            </div>
          )}

          {/* User info saat session sudah ada */}
          {status === "authenticated" && session?.user && (
            <>
              <div className="px-3 py-2 mb-1">
                <p className="text-xs font-semibold text-on-surface truncate">
                  {session.user.name || "Pengguna"}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {session.user.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium text-error hover:bg-error-container/30 transition-colors"
              >
                <LogOut size={18} />
                Keluar
              </button>
            </>
          )}

          {/* Unauthenticated — tampilkan link login */}
          {status === "unauthenticated" && (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-card text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
