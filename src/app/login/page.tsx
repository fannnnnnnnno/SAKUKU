"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { loginUser } from "@/lib/actions/auth";
import Link from "next/link";
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !state?.success) {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      router.replace(callbackUrl);
      return;
    }

    if (state?.success) {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      router.replace(callbackUrl);
    }
  }, [router, searchParams, state?.success, status]);

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl shadow-xl border border-surface-high overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-8 text-center text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Wallet size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold">SAKUKU</h1>
          <p className="text-sm opacity-90 mt-1">Masuk untuk mengelola keuangan Anda</p>
        </div>

        {/* Form */}
        <form action={formAction} className="p-6 space-y-5">
          {state?.error && (
            <div className="bg-error-container text-error text-sm p-3 rounded-card text-center font-medium border border-error/20 animate-in fade-in duration-200">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-3 border border-outline-variant rounded-card px-4 py-3 bg-surface focus-within:border-primary transition-colors">
                <Mail size={18} className="text-on-surface-variant" />
                <input
                  type="email"
                  name="email"
                  placeholder="nama@email.com"
                  required
                  className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-outline-variant"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-on-surface-variant block">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="flex items-center gap-3 border border-outline-variant rounded-card px-4 py-3 bg-surface focus-within:border-primary transition-colors">
                <Lock size={18} className="text-on-surface-variant" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
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
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Register Link */}
          <p className="text-center text-xs text-on-surface-variant mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
