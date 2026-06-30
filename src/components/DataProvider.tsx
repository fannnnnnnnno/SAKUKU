"use client";

import { useEffect } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  useEffect(() => {
    loadCategories().then(() => loadTransactions());
  }, [loadCategories, loadTransactions]);

  return <>{children}</>;
}
