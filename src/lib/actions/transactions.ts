"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { Transaction } from "@/types";

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

  return prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount: tx.amount,
      type: tx.type,
      categoryId: tx.categoryId,
      note: tx.note,
      date: new Date(tx.date),
      source: tx.source,
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

  return prisma.transaction.update({
    where: { id },
    data: {
      amount: tx.amount,
      type: tx.type,
      categoryId: tx.categoryId,
      note: tx.note,
      date: tx.date ? new Date(tx.date) : undefined,
      source: tx.source,
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
