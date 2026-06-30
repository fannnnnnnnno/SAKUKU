"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import crypto from "crypto";

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Semua bidang harus diisi" };
  }

  if (password.length < 6) {
    return { error: "Password minimal harus 6 karakter" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Seed kategori default untuk pengguna baru
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
      data: defaultCategories.map((cat) => ({
        userId: user.id,
        ...cat,
      })),
    });
  } catch (err) {
    console.error("Register error:", err);
    return { error: "Gagal mendaftarkan akun. Silakan coba lagi." };
  }

  // Auto login setelah register
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof Error && (error as any).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Pendaftaran berhasil, tetapi gagal masuk otomatis. Silakan masuk manual." };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
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
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email harus diisi" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Mengembalikan pesan sukses palsu untuk keamanan mencegah pencarian email (user enumeration)
      return { success: true, message: "Jika email terdaftar, instruksi reset akan dikirimkan." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 jam kedaluwarsa

    // Hapus token lama jika ada
    await prisma.resetToken.deleteMany({
      where: { email },
    });

    // Simpan token baru
    await prisma.resetToken.create({
      data: {
        token,
        email,
        expires,
      },
    });

    // Simulasi pengiriman email ke console
    console.log(`\n=== RESET PASSWORD LINK ===\nhttp://localhost:3000/reset-password?token=${token}\n===========================\n`);
    
    return { 
      success: true, 
      message: "Instruksi reset password telah dikirimkan ke email Anda.",
      debugToken: process.env.NODE_ENV !== "production" ? token : undefined
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
    const resetToken = await prisma.resetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { error: "Token tidak valid atau telah kedaluwarsa" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.resetToken.delete({
        where: { token },
      }),
    ]);

    return { success: true, message: "Password berhasil diperbarui. Silakan masuk." };
  } catch (err) {
    console.error("Reset password error:", err);
    return { error: "Gagal memperbarui password." };
  }
}
