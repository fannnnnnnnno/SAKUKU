"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { Transaction } from "@/types";

function normalizeTransactionPayload(tx: Partial<Transaction>) {
  const amount = typeof tx.amount === "number" ? tx.amount : Number(tx.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Jumlah transaksi harus lebih dari 0");
  }

  const type = tx.type === "income" || tx.type === "expense" ? tx.type : null;
  if (!type) {
    throw new Error("Jenis transaksi tidak valid");
  }

  const categoryId = typeof tx.categoryId === "string" ? tx.categoryId.trim() : "";
  if (!categoryId) {
    throw new Error("Kategori wajib dipilih");
  }

  const note = typeof tx.note === "string" ? tx.note.trim() : "";
  const dateValue = tx.date ? new Date(tx.date) : new Date();
  if (Number.isNaN(dateValue.getTime())) {
    throw new Error("Tanggal tidak valid");
  }

  const source = tx.source === "scan" || tx.source === "manual" ? tx.source : "manual";

  return {
    amount,
    type,
    categoryId,
    note: note || null,
    date: dateValue,
    source,
  };
}

async function ensureCategoryBelongsToUser(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Kategori tidak valid untuk akun ini");
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const txs = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return txs.map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.type as "income" | "expense",
    categoryId: t.categoryId,
    note: t.note || undefined,
    date: t.date.toISOString(),
    source: t.source as "manual" | "scan",
    createdAt: t.createdAt.toISOString(),
  }));
}

export async function createTransaction(tx: Omit<Transaction, "id" | "createdAt">) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const payload = normalizeTransactionPayload(tx);
  await ensureCategoryBelongsToUser(session.user.id, payload.categoryId);

  return prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount: payload.amount,
      type: payload.type,
      categoryId: payload.categoryId,
      note: payload.note,
      date: payload.date,
      source: payload.source,
    },
  });
}

export async function updateTransactionAction(id: string, tx: Partial<Transaction>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Not found");

  const mergedPayload = {
    amount: tx.amount ?? existing.amount,
    type: tx.type ?? existing.type,
    categoryId: tx.categoryId ?? existing.categoryId,
    note: tx.note ?? existing.note ?? undefined,
    date: tx.date ?? existing.date.toISOString(),
    source: tx.source ?? existing.source,
  } as Partial<Transaction>;

  const payload = normalizeTransactionPayload(mergedPayload);
  await ensureCategoryBelongsToUser(session.user.id, payload.categoryId);

  return prisma.transaction.update({
    where: { id },
    data: {
      amount: payload.amount,
      type: payload.type,
      categoryId: payload.categoryId,
      note: payload.note,
      date: payload.date,
      source: payload.source,
    },
  });
}

export async function deleteTransactionAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Not found");

  return prisma.transaction.delete({
    where: { id },
  });
}

export async function resetUserData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

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

  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({ where: { userId } });
    await tx.category.deleteMany({ where: { userId } });
    await tx.category.createMany({
      data: defaultCategories.map((cat) => ({
        userId,
        ...cat,
      })),
    });
  });
}
