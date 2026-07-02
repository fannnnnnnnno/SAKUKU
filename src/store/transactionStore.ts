import { create } from "zustand";
import type { Transaction } from "@/types";
import {
  getTransactions,
  createTransaction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/lib/actions/transactions";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  reset: () => void;
  loadTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  reset: () => set({ transactions: [], isLoading: false }),

  loadTransactions: async () => {
    set({ isLoading: true });
    try {
      const all = await getTransactions();
      set({ transactions: all, isLoading: false });
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
      set({ isLoading: false });
    }
  },

  addTransaction: async (tx) => {
    try {
      await createTransaction(tx);
      await get().loadTransactions();
    } catch (err) {
      console.error("Gagal menambahkan transaksi:", err);
    }
  },

  updateTransaction: async (id, tx) => {
    try {
      await updateTransactionAction(id, tx);
      await get().loadTransactions();
    } catch (err) {
      console.error("Gagal memperbarui transaksi:", err);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await deleteTransactionAction(id);
      await get().loadTransactions();
    } catch (err) {
      console.error("Gagal menghapus transaksi:", err);
    }
  },
}));
