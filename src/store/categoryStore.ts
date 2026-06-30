import { create } from "zustand";
import type { Category } from "@/types";
import {
  getCategories,
  createCategory,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/categories";
import { useTransactionStore } from "@/store/transactionStore";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  loadCategories: () => Promise<void>;
  addCategory: (cat: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const all = await getCategories();
      set({ categories: all, isLoading: false });
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
      set({ isLoading: false });
    }
  },

  addCategory: async (cat) => {
    try {
      await createCategory(cat);
      await get().loadCategories();
    } catch (err) {
      console.error("Gagal menambahkan kategori:", err);
    }
  },

  updateCategory: async (id, cat) => {
    try {
      await updateCategoryAction(id, cat);
      await get().loadCategories();
    } catch (err) {
      console.error("Gagal memperbarui kategori:", err);
    }
  },

  deleteCategory: async (id) => {
    try {
      await deleteCategoryAction(id);
      await get().loadCategories();
      await useTransactionStore.getState().loadTransactions();
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
    }
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c.id === id);
  },
}));
