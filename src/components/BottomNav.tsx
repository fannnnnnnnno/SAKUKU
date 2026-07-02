"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, ScanLine, PieChart, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/transaksi", label: "Transaksi", icon: Receipt },
  { href: "/scan", label: "Scan", icon: ScanLine, isCenter: true },
  { href: "/laporan", label: "Laporan", icon: PieChart },
  { href: "/pengaturan", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-lowest border-t border-surface-high px-2 py-2 flex items-center justify-around z-20">
      {navItems.map(({ href, label, icon: Icon, isCenter }) => {
        const isActive = pathname === href;

        if (isCenter) {
          return (
            <Link key={href} href={href} className="flex flex-col items-center -mt-6">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                  isActive ? "bg-primary" : "bg-primary-container"
                }`}
              >
                <Icon size={24} color="white" />
              </div>
            </Link>
          );
        }

        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 px-3 py-1">
            <Icon
              size={22}
              color={isActive ? "var(--color-primary)" : "var(--color-outline)"}
            />
            <span className={`text-xs ${isActive ? "text-primary font-medium" : "text-outline"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
