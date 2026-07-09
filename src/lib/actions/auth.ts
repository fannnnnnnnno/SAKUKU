"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import crypto from "crypto";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function sendResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Development: tampilkan di console
    console.log(`\n=== RESET PASSWORD LINK ===\n${resetUrl}\n===========================\n`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "SAKUKU <noreply@mchralf.my.id>",
    to,
    subject: "Reset Password SAKUKU",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#FCF9F8;">
        <div style="background:linear-gradient(135deg,#006E08,#00AA13);padding:28px 24px;border-radius:16px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:26px;font-weight:700;">SAKUKU</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Aplikasi Pencatat Pengeluaran</p>
        </div>
        <div style="background:white;border-radius:16px;padding:28px;border:1px solid #E5E2E1;">
          <p style="color:#1C1B1B;font-size:15px;margin:0 0 12px;">Halo,</p>
          <p style="color:#3E4A39;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Kami menerima permintaan <strong>reset password</strong> untuk akun SAKUKU yang terhubung dengan email ini.
            Klik tombol di bawah untuk membuat password baru:
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}"
               style="background:#006E08;color:white;padding:14px 36px;border-radius:9999px;
                      text-decoration:none;font-weight:600;font-size:15px;display:inline-block;
                      box-shadow:0 4px 12px rgba(0,110,8,0.3);">
              Reset Password
            </a>
          </div>
          <div style="background:#F6F3F2;border-radius:12px;padding:14px 16px;margin-top:20px;">
            <p style="color:#6D7B67;font-size:12px;margin:0;text-align:center;">
              ⏱ Link ini berlaku selama <strong>1 jam</strong>.<br/>
              Jika kamu tidak meminta reset password, abaikan email ini.
            </p>
          </div>
        </div>
        <p style="color:#BCCBB4;font-size:11px;text-align:center;margin-top:20px;">
          © 2026 SAKUKU — Dibuat untuk pengguna Indonesia
        </p>
      </div>
    `,
  });
}

export async function registerUser(prevState: any, formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = normalizeEmail((formData.get("email") as string | null) ?? "");
  const password = (formData.get("password") as string | null) ?? "";

  if (!name || !email || !password) {
    return { error: "Semua bidang harus diisi" };
  }

  if (password.length < 6) {
    return { error: "Password minimal harus 6 karakter" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const defaultCategories = [
      { name: "Makanan", icon: "Utensils", color: "#F4A261" },
      { name: "Transport", icon: "Car", color: "#7FB069" },
      { name: "Belanja", icon: "ShoppingBag", color: "#9B5DE5" },
      { name: "Hiburan", icon: "Clapperboard", color: "#F15BB5" },
      { name: "Listrik", icon: "Zap", color: "#FEE440" },
      { name: "Kesehatan", icon: "HeartPulse", color: "#00BBF9" },
      { name: "Gaji", icon: "Wallet", color: "#4361EE" },
      { name: "Lainnya", icon: "MoreHorizontal", color: "#A8A8A8" },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({ userId: user.id, ...cat })),
    });
  } catch (err) {
    console.error("Register error:", err);
    return { error: "Gagal mendaftarkan akun. Silakan coba lagi." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof Error && (error as any).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Pendaftaran berhasil, tetapi gagal masuk otomatis. Silakan masuk manual." };
  }

  return { success: true };
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = normalizeEmail((formData.get("email") as string | null) ?? "");
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email dan password harus diisi" };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Email atau password salah." };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && (error as any).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    return { error: "Terjadi kesalahan saat masuk." };
  }
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const email = normalizeEmail((formData.get("email") as string | null) ?? "");

  if (!email) return { error: "Email harus diisi" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Selalu return sukses untuk cegah user enumeration
    if (!user) {
      return { success: true, message: "Jika email terdaftar, instruksi reset akan dikirimkan." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 jam

    await prisma.resetToken.deleteMany({ where: { email } });
    await prisma.resetToken.create({ data: { token, email, expires } });

    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

    await sendResetEmail(email, resetUrl);

    return {
      success: true,
      message: "Instruksi reset password telah dikirimkan ke email Anda.",
      debugToken: process.env.NODE_ENV !== "production" ? token : undefined,
    };
  } catch (err) {
    console.error("Forgot password error:", err);
    return { error: "Gagal memproses permintaan." };
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) {
    return { error: "Semua bidang harus diisi" };
  }
  if (password !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok" };
  }
  if (password.length < 6) {
    return { error: "Password minimal harus 6 karakter" };
  }

  try {
    const resetToken = await prisma.resetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.expires < new Date()) {
      return { error: "Token tidak valid atau telah kedaluwarsa" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.resetToken.delete({ where: { token } }),
    ]);

    return { success: true, message: "Password berhasil diperbarui. Silakan masuk." };
  } catch (err) {
    console.error("Reset password error:", err);
    return { error: "Gagal memperbarui password." };
  }
}