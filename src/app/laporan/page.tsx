"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { formatRupiah, formatMonthYear, getMonthRange } from "@/lib/formatters";
import { BottomNav } from "@/components/BottomNav";
import type { TransactionType } from "@/types";

export default function LaporanScreen() {
  const router = useRouter();
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");

  const { breakdown, total } = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth);
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === activeTab && d >= start && d <= end;
    });

    const byCategory: Record<string, number> = {};
    for (const tx of filtered) {
      byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount;
    }

    const total = Object.values(byCategory).reduce((a, b) => a + b, 0);

    const breakdown = Object.entries(byCategory)
      .map(([categoryId, amount]) => {
        const cat = categories.find((c) => c.id === categoryId);
        return {
          name: cat?.name || "Lainnya",
          value: amount,
          color: cat?.color || "#A8A8A8",
          percent: total > 0 ? Math.round((amount / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    return { breakdown, total };
  }, [transactions, categories, currentMonth, activeTab]);

  const changeMonth = (delta: number) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + delta);
    setCurrentMonth(next);
  };

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-6 pb-4 md:px-0">
        <button onClick={() => router.back()} className="md:hidden">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-lg font-bold text-primary md:text-2xl md:text-on-surface">Laporan</h1>
      </div>

      {/* Month Selector & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 md:px-0 mb-6">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <button onClick={() => changeMonth(-1)}>
            <ChevronLeft size={20} className="text-on-surface" />
          </button>
          <span className="font-semibold text-on-surface capitalize">
            {formatMonthYear(currentMonth)}
          </span>
          <button onClick={() => changeMonth(1)}>
            <ChevronRight size={20} className="text-on-surface" />
          </button>
        </div>

        <div className="w-full md:w-64">
          <div className="flex bg-surface-container rounded-full p-1">
            <button
              onClick={() => setActiveTab("expense")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "expense"
                  ? "bg-primary-container text-white"
                  : "text-on-surface-variant"
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "income"
                  ? "bg-primary-container text-white"
                  : "text-on-surface-variant"
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 md:px-0">
        {breakdown.length === 0 ? (
          <div className="bg-surface-lowest rounded-card p-12 text-center shadow-sm">
            <p className="text-sm text-on-surface-variant">Belum ada data untuk bulan ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart Card */}
            <div className="bg-surface-lowest rounded-card p-5 shadow-sm flex flex-col items-center justify-center">
              <h3 className="font-bold text-on-surface mb-4 self-start">Proporsi</h3>
              <div className="relative h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {breakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xs text-on-surface-variant">Total</p>
                  <p className="text-lg font-bold text-on-surface">{formatRupiah(total)}</p>
                </div>
              </div>
            </div>

            {/* Breakdown List Card */}
            <div className="bg-surface-lowest rounded-card p-5 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Rincian Kategori</h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {breakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-surface-high/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-on-surface font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-on-surface">
                        {formatRupiah(item.value)}
                      </p>
                      <p className="text-xs text-on-surface-variant">{item.percent}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
