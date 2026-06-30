"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, ScanLine, PieChart, Settings, Wallet } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/transaksi", label: "Transaksi", icon: Receipt },
  { href: "/scan", label: "Scan Struk", icon: ScanLine },
  { href: "/laporan", label: "Laporan", icon: PieChart },
  { href: "/kategori", label: "Kategori", icon: Wallet },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 fixed left-0 top-0 h-screen bg-surface-lowest border-r border-surface-high px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Wallet size={18} color="white" />
        </div>
        <h1 className="text-lg font-bold text-primary">SAKUKU</h1>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-container/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/tambah"
        className="mt-auto flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-full text-sm"
      >
        + Tambah Transaksi
      </Link>
    </aside>
  );
}
