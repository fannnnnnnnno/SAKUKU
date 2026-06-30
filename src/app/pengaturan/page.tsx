"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Tag,
  Upload,
  Database,
  Info,
  Globe,
  Trash2,
  User,
  LogOut,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { signOut } from "next-auth/react";
import { resetUserData } from "@/lib/actions/transactions";

export default function PengaturanScreen() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetUserData();
      window.location.href = "/";
    } catch (err) {
      console.error("Gagal mereset data:", err);
      setIsResetting(false);
    }
  };

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
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full bg-surface-lowest border border-outline text-on-surface hover:bg-surface-container/50 font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <LogOut size={16} />
          Keluar dari Akun
        </button>
      </div>

      {/* Reset Data */}
      <div className="px-5 mt-5">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full border-2 border-error text-error font-semibold py-3 rounded-full flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Reset Semua Data
          </button>
        ) : (
          <div className="bg-error-container rounded-card p-4">
            <p className="text-sm text-on-error-container font-medium mb-3 text-center">
              Yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-full border border-outline-variant text-sm font-medium bg-surface-lowest"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-full bg-error text-white text-sm font-medium disabled:opacity-50"
              >
                {isResetting ? "Mereset..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        )}
        <p className="text-xs text-on-surface-variant text-center mt-3 px-4">
          Tindakan ini tidak dapat dibatalkan. Pastikan Anda telah mencadangkan data
          Anda.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
