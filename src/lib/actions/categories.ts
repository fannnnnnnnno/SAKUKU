"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { Category } from "@/types";

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

  return prisma.category.create({
    data: {
      userId: session.user.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      monthlyLimit: cat.monthlyLimit,
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

  return prisma.category.update({
    where: { id },
    data: {
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      monthlyLimit: cat.monthlyLimit,
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
