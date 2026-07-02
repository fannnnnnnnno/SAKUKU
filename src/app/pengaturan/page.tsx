"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Tag,
  Upload,
  Database,
  Info,
  Globe,
  User,
  LogOut,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { signOut } from "next-auth/react";

export default function PengaturanScreen() {
  const router = useRouter();

  const menuItems = [
    { icon: Tag, label: "Kategori", href: "/kategori" },
    { icon: Upload, label: "Export Data", href: "#" },
    { icon: Database, label: "Backup Lokal", href: "#" },
    { icon: Info, label: "Tentang Aplikasi", href: "#" },
    { icon: Globe, label: "Bahasa", href: "#", subtitle: "Indonesia" },
  ];

  return (
    <main className="min-h-screen bg-surface pb-24">
      <div className="flex items-center gap-4 px-5 pt-6 pb-4">
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-lg font-bold text-primary">Pengaturan</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5">
        <div className="bg-surface-lowest rounded-card p-6 flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center">
            <User size={36} className="text-primary-container" />
          </div>
          <p className="font-bold text-on-surface mt-3">SAKUKU</p>
          <span className="text-xs bg-surface-container text-on-surface-variant px-3 py-1 rounded-full mt-1">
            Versi 1.0.0
          </span>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-5 mt-4">
        <div className="bg-surface-lowest rounded-card shadow-sm divide-y divide-surface-high overflow-hidden">
          {menuItems.map(({ icon: Icon, label, href, subtitle }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-3 p-4 hover:bg-surface-container/50"
            >
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
                <Icon size={18} className="text-on-surface" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">{label}</p>
                {subtitle && (
                  <p className="text-xs text-on-surface-variant">{subtitle}</p>
                )}
              </div>
              <ChevronRight size={18} className="text-outline" />
            </a>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-5 mt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full bg-surface-lowest border border-outline text-on-surface hover:bg-surface-container/50 font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <LogOut size={16} />
          Keluar dari Akun
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
