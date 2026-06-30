"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/lib/actions/auth";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl shadow-xl border border-surface-high overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-8 text-center text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <h1 className="text-2xl font-bold">Lupa Password</h1>
          <p className="text-sm opacity-90 mt-1">Kami akan mengirimkan link untuk mengatur ulang password Anda</p>
        </div>

        {/* Form / Success Content */}
        <div className="p-6">
          {state?.success ? (
            <div className="text-center space-y-4 py-4">
              <div className="bg-primary-container/15 text-primary text-sm p-4 rounded-card border border-primary-container/20 font-medium">
                {state.message}
              </div>

              {state.debugToken && (
                <div className="bg-surface-container rounded-card p-4 text-left border border-outline-variant">
                  <p className="text-xs font-bold text-on-surface mb-1">🔧 Development Mode Link:</p>
                  <Link
                    href={`/reset-password?token=${state.debugToken}`}
                    className="text-xs text-primary font-mono break-all hover:underline"
                  >
                    {`http://localhost:3000/reset-password?token=${state.debugToken}`}
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline pt-2"
              >
                <ArrowLeft size={16} />
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div className="bg-error-container text-error text-sm p-3 rounded-card text-center font-medium border border-error/20">
                  {state.error}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                  Masukkan Email Anda
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Link Reset
                    <Send size={16} />
                  </>
                )}
              </button>

              {/* Back to Login */}
              <p className="text-center text-xs text-on-surface-variant mt-4">
                <Link href="/login" className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
                  <ArrowLeft size={14} />
                  Kembali ke Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
