"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth";
import Link from "next/link";
import { Lock, Loader2, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <div className="p-6">
      {!token ? (
        <div className="text-center space-y-4 py-4">
          <div className="bg-error-container text-error text-sm p-4 rounded-card border border-error/20 font-medium">
            Token tidak valid atau tidak ditemukan. Silakan minta link reset baru.
          </div>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
          >
            Minta Link Baru
          </Link>
        </div>
      ) : state?.success ? (
        <div className="text-center space-y-4 py-4">
          <div className="bg-primary-container/15 text-primary text-sm p-4 rounded-card border border-primary-container/20 font-medium font-semibold">
            {state.message}
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white bg-primary hover:bg-primary/95 px-6 py-2.5 rounded-full font-bold text-sm shadow-md"
          >
            Masuk Sekarang
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-error-container text-error text-sm p-3 rounded-card text-center font-medium border border-error/20">
              {state.error}
            </div>
          )}

          <input type="hidden" name="token" value={token} />

          <div className="space-y-4">
            {/* Password Baru */}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Password Baru
              </label>
              <div className="flex items-center gap-3 border border-outline-variant rounded-card px-4 py-3 bg-surface focus-within:border-primary transition-colors">
                <Lock size={18} className="text-on-surface-variant" />
                <input
                  type="password"
                  name="password"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Konfirmasi Password Baru
              </label>
              <div className="flex items-center gap-3 border border-outline-variant rounded-card px-4 py-3 bg-surface focus-within:border-primary transition-colors">
                <Lock size={18} className="text-on-surface-variant" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Ulangi password baru"
                  required
                  minLength={6}
                  className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Memperbarui...
              </>
            ) : (
              <>
                Perbarui Password
                <KeyRound size={16} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl shadow-xl border border-surface-high overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-8 text-center text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <h1 className="text-2xl font-bold">Atur Ulang Password</h1>
          <p className="text-sm opacity-90 mt-1">Silakan masukkan password baru Anda</p>
        </div>

        <Suspense
          fallback={
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
