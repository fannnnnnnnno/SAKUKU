import Dexie, { type EntityTable } from "dexie";
import type { Transaction, Category } from "@/types";

const db = new Dexie("SakukuDB") as Dexie & {
  transactions: EntityTable<Transaction, "id">;
  categories: EntityTable<Category, "id">;
};

db.version(1).stores({
  transactions: "id, type, categoryId, date, createdAt",
  categories: "id, name",
});

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-makanan", name: "Makanan", icon: "Utensils", color: "#F4A261" },
  { id: "cat-transport", name: "Transport", icon: "Car", color: "#7FB069" },
  { id: "cat-belanja", name: "Belanja", icon: "ShoppingBag", color: "#9B5DE5" },
  { id: "cat-hiburan", name: "Hiburan", icon: "Clapperboard", color: "#F15BB5" },
  { id: "cat-listrik", name: "Listrik", icon: "Zap", color: "#FEE440" },
  { id: "cat-kesehatan", name: "Kesehatan", icon: "HeartPulse", color: "#00BBF9" },
  { id: "cat-gaji", name: "Gaji", icon: "Wallet", color: "#4361EE" },
  { id: "cat-lainnya", name: "Lainnya", icon: "MoreHorizontal", color: "#A8A8A8" },
];

export async function seedDefaultCategories() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }
}

export default db;
