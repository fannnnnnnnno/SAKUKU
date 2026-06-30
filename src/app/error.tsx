"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl shadow-xl border border-surface-high p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-error" />
        </div>
        <h1 className="text-xl font-bold text-on-surface mb-2">Terjadi Kesalahan</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="bg-primary hover:bg-primary/95 text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 mx-auto text-sm shadow-md transition-all"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    </main>
  );
}
