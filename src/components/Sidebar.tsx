"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, ScanLine, PieChart, Settings, Wallet, LogOut, Tag } from "lucide-react";
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
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-60 fixed left-0 top-0 h-screen bg-surface-lowest border-r border-surface-high px-4 py-6 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Wallet size={18} color="white" />
        </div>
        <h1 className="text-lg font-bold text-primary">SAKUKU</h1>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
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

      {/* Bottom: User info + Logout */}
      <div className="mt-auto space-y-3">
        <Link
          href="/tambah"
          className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-full text-sm hover:bg-primary/90 transition-colors"
        >
          + Tambah Transaksi
        </Link>

        {session?.user && (
          <div className="border-t border-surface-high pt-3">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-semibold text-on-surface truncate">
                {session.user.name || "Pengguna"}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                {session.user.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium text-error hover:bg-error-container/30 transition-colors"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
