"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { formatRupiah, formatDateLabel, formatTime } from "@/lib/formatters";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";

export default function TransaksiScreen() {
  const router = useRouter();
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategory) return transactions;
    return transactions.filter((t) => t.categoryId === activeCategory);
  }, [transactions, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    for (const tx of filtered) {
      const label = formatDateLabel(tx.date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    }
    return groups;
  }, [filtered]);

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="text-lg font-bold text-on-surface">Transaksi</h1>
        <button className="p-1">
          <SlidersHorizontal size={20} className="text-on-surface" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 px-5 md:px-0">
        {/* Left Column: Filter Kategori */}
        <div className="md:col-span-1">
          <h2 className="hidden md:block font-bold text-on-surface mb-3">Filter Kategori</h2>
          
          {/* Mobile Horizontal Scroll */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === null
                  ? "bg-primary-container text-white"
                  : "border border-outline-variant text-on-surface"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-primary-container text-white"
                    : "border border-outline-variant text-on-surface"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Desktop Vertical Menu */}
          <div className="hidden md:flex flex-col gap-1 bg-surface-lowest rounded-card p-3 shadow-sm border border-surface-high">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-card text-sm font-medium text-left transition-colors ${
                activeCategory === null
                  ? "bg-primary-container/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span>Semua Transaksi</span>
              <span className="text-xs bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full font-semibold">
                {transactions.length}
              </span>
            </button>
            {categories.map((cat) => {
              const count = transactions.filter((t) => t.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-card text-sm font-medium text-left transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary-container/15 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-xs bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full font-semibold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Daftar Transaksi */}
        <div className="md:col-span-2 mt-4 md:mt-0">
          <h2 className="hidden md:block font-bold text-on-surface mb-3">Daftar Transaksi</h2>
          <div className="space-y-5">
            {Object.keys(grouped).length === 0 && (
              <div className="bg-surface-lowest rounded-card p-12 text-center shadow-sm border border-dashed border-outline-variant">
                <p className="text-sm text-on-surface-variant">Tidak ada transaksi.</p>
              </div>
            )}
            {Object.entries(grouped).map(([label, txs]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-2">
                  {label}
                </p>
                <div className="bg-surface-lowest rounded-card divide-y divide-surface-high overflow-hidden shadow-sm">
                  {txs.map((tx) => {
                    const category = getCategoryById(tx.categoryId);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 hover:bg-surface-container/30 transition-colors"
                      >
                        <CategoryIcon
                          icon={category?.icon || "Circle"}
                          color={category?.color || "#A8A8A8"}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">
                            {tx.note || category?.name || "Transaksi"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {category?.name} • {formatTime(tx.date)}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            tx.type === "income" ? "text-primary-container" : "text-error"
                          }`}
                        >
                          {tx.type === "income" ? "+ " : "- "}
                          {formatRupiah(tx.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
