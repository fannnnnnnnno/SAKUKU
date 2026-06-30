import Link from "next/link";
import { Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl shadow-xl border border-surface-high p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
          <FileQuestion size={28} className="text-outline" />
        </div>
        <h1 className="text-xl font-bold text-on-surface mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary/95 text-white font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center gap-2 text-sm shadow-md transition-all"
        >
          <Home size={16} />
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
