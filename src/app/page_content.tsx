"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bell, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { formatRupiah, formatDateLabel, getMonthRange } from "@/lib/formatters";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardScreen() {
  const transactions = useTransactionStore((s) => s.transactions);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);

  const summary = useMemo(() => {
    const { start, end } = getMonthRange(new Date());
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    const income = thisMonth
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = thisMonth
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 4);

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 md:px-0">
        <h1 className="text-xl font-bold text-primary md:hidden">SAKUKU</h1>
        <h1 className="hidden md:block text-2xl font-bold text-on-surface">Dashboard</h1>
        <button className="p-2 rounded-full hover:bg-surface-container">
          <Bell size={22} className="text-on-surface" />
        </button>
      </div>

      <div className="md:grid md:grid-cols-3 md:gap-5 md:px-0 px-5">
        {/* Left Column: Balance + Summary */}
        <div className="md:col-span-2">
          {/* Balance Card */}
          <div
            className="rounded-card p-5 md:p-7 text-white relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
            }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">
              Saldo Bulan Ini
            </p>
            <p className="text-3xl md:text-4xl font-bold mt-1">
              {formatRupiah(summary.balance)}
            </p>

            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowDownLeft size={16} />
                </div>
                <div>
                  <p className="text-[11px] opacity-80">Income</p>
                  <p className="text-sm font-semibold">{formatRupiah(summary.income)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <p className="text-[11px] opacity-80">Expense</p>
                  <p className="text-sm font-semibold">{formatRupiah(summary.expense)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Small Cards */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-surface-lowest rounded-card p-4 shadow-sm">
              <p className="text-xs text-on-surface-variant mb-1">Pemasukan</p>
              <p className="text-lg font-bold text-primary-container">
                {formatRupiah(summary.income)}
              </p>
            </div>
            <div className="bg-surface-lowest rounded-card p-4 shadow-sm">
              <p className="text-xs text-on-surface-variant mb-1">Pengeluaran</p>
              <p className="text-lg font-bold text-error">{formatRupiah(summary.expense)}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions (desktop only sits beside balance) */}
        <div className="mt-6 md:mt-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-on-surface">Transaksi Terakhir</h2>
            <Link href="/transaksi" className="text-sm text-primary-container font-medium">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-2">
            {recentTransactions.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-8">
                Belum ada transaksi. Tambahkan transaksi pertamamu!
              </p>
            )}
            {recentTransactions.map((tx) => {
              const category = getCategoryById(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="bg-surface-lowest rounded-card p-3 flex items-center gap-3 shadow-sm"
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
                      {formatDateLabel(tx.date)}
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
      </div>

      {/* FAB - mobile only, desktop uses sidebar button */}
      <Link
        href="/tambah"
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary-container flex items-center justify-center shadow-lg max-w-md"
      >
        <Plus size={28} color="white" />
      </Link>

      <BottomNav />
    </main>
  );
}
