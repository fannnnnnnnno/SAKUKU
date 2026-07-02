"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { Category } from "@/types";

function normalizeCategoryPayload(cat: Partial<Category> | { name?: string; icon?: string; color?: string; monthlyLimit?: number | null }) {
  const name = typeof cat.name === "string" ? cat.name.trim() : "";
  if (!name) {
    throw new Error("Nama kategori wajib diisi");
  }

  const icon = typeof cat.icon === "string" && cat.icon.trim() ? cat.icon.trim() : "Circle";
  const color = typeof cat.color === "string" && cat.color.trim() ? cat.color.trim() : "#A8A8A8";
  const monthlyLimit = typeof cat.monthlyLimit === "number"
    ? cat.monthlyLimit
    : cat.monthlyLimit !== undefined && cat.monthlyLimit !== null
      ? Number(cat.monthlyLimit)
      : undefined;

  if (monthlyLimit !== undefined && (!Number.isFinite(monthlyLimit) || monthlyLimit < 0)) {
    throw new Error("Batas bulanan tidak valid");
  }

  return {
    name,
    icon,
    color,
    monthlyLimit: monthlyLimit ?? null,
  };
}

export async function getCategories(): Promise<Category[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const cats = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    monthlyLimit: c.monthlyLimit || undefined,
  }));
}

export async function createCategory(cat: Omit<Category, "id">) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const payload = normalizeCategoryPayload(cat);
  const existing = await prisma.category.findFirst({
    where: { userId: session.user.id, name: payload.name },
  });

  if (existing) {
    throw new Error("Kategori sudah ada");
  }

  return prisma.category.create({
    data: {
      userId: session.user.id,
      name: payload.name,
      icon: payload.icon,
      color: payload.color,
      monthlyLimit: payload.monthlyLimit,
    },
  });
}

export async function updateCategoryAction(id: string, cat: Partial<Category>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.category.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Not found");

  const payload = normalizeCategoryPayload({
    ...existing,
    ...cat,
  });

  const duplicate = await prisma.category.findFirst({
    where: {
      userId: session.user.id,
      name: payload.name,
      NOT: { id },
    },
  });

  if (duplicate) {
    throw new Error("Kategori sudah ada");
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: payload.name,
      icon: payload.icon,
      color: payload.color,
      monthlyLimit: payload.monthlyLimit,
    },
  });
}

export async function deleteCategoryAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.category.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Not found");

  return prisma.category.delete({
    where: { id },
  });
}
