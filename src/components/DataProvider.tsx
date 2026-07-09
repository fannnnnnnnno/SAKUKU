"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const resetTransactions = useTransactionStore((s) => s.reset);
  const resetCategories = useCategoryStore((s) => s.reset);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (status === "loading") return;

    const userId = session?.user?.id ?? null;
    const prevUserId = requestIdRef.current;

    // Hanya reset kalau benar-benar logout (userId berubah dari ada → null)
    if (!userId && prevUserId !== 0) {
      requestIdRef.current = 0;
      resetTransactions();
      resetCategories();
      return;
    }

    if (!userId) {
      requestIdRef.current = 0;
      return;
    }

    requestIdRef.current = userId;

    const syncUserData = async () => {
      try {
        await Promise.all([loadCategories(), loadTransactions()]);
      } catch (error) {
        console.error("Gagal menyinkronkan data pengguna:", error);
      }
    };

    void syncUserData();
  }, [status, session?.user?.id, loadCategories, loadTransactions, resetCategories, resetTransactions]);

  return <>{children}</>;
}
