"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { formatRupiah, formatMonthYear, getMonthRange } from "@/lib/formatters";
import { BottomNav } from "@/components/BottomNav";
import type { Transaction, TransactionType } from "@/types";

export default function LaporanScreen() {
  const router = useRouter();
  const transactions = useTransactionStore((s) => s.transactions);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", note: "", date: "", categoryId: "" });

  const { breakdown, total, monthlyTransactions } = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth);
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === activeTab && d >= start && d <= end;
    });

    const monthlyTransactions = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

    return { breakdown, total, monthlyTransactions };
  }, [transactions, categories, currentMonth, activeTab]);

  const startEdit = (tx: Transaction) => {
    setEditingTransactionId(tx.id);
    setEditForm({
      amount: tx.amount.toString(),
      note: tx.note || "",
      date: new Date(tx.date).toISOString().slice(0, 10),
      categoryId: tx.categoryId,
    });
  };

  const cancelEdit = () => {
    setEditingTransactionId(null);
    setEditForm({ amount: "", note: "", date: "", categoryId: "" });
  };

  const saveEdit = async () => {
    if (!editingTransactionId) return;

    const amount = Number(editForm.amount);
    if (!editForm.date || Number.isNaN(amount) || amount <= 0 || !editForm.categoryId) {
      return;
    }

    await updateTransaction(editingTransactionId, {
      amount,
      note: editForm.note,
      date: new Date(editForm.date).toISOString(),
      categoryId: editForm.categoryId,
    });

    cancelEdit();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    await deleteTransaction(id);
  };

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

        <div className="mt-6 bg-surface-lowest rounded-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Transaksi Bulan Ini</h3>
            <span className="text-xs text-on-surface-variant">{monthlyTransactions.length} item</span>
          </div>

          {monthlyTransactions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Belum ada transaksi yang bisa diedit.</p>
          ) : (
            <div className="space-y-3">
              {monthlyTransactions.map((tx) => {
                const category = categories.find((c) => c.id === tx.categoryId);
                const isEditing = editingTransactionId === tx.id;

                return (
                  <div key={tx.id} className="rounded-card border border-surface-high p-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="text-xs text-on-surface-variant">
                            Nominal
                            <input
                              type="number"
                              value={editForm.amount}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            />
                          </label>

                          <label className="text-xs text-on-surface-variant">
                            Kategori
                            <select
                              value={editForm.categoryId}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="text-xs text-on-surface-variant md:col-span-2">
                            Catatan
                            <input
                              type="text"
                              value={editForm.note}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            />
                          </label>

                          <label className="text-xs text-on-surface-variant md:col-span-2">
                            Tanggal
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            />
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-full border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-on-surface">{formatRupiah(tx.amount)}</p>
                            <span className="rounded-full bg-surface-container px-2 py-1 text-[11px] text-on-surface-variant">
                              {category?.name || "Lainnya"}
                            </span>
                          </div>
                          {tx.note ? <p className="mt-1 text-sm text-on-surface-variant">{tx.note}</p> : null}
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {new Date(tx.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(tx)}
                            className="flex items-center gap-1 rounded-full border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="flex items-center gap-1 rounded-full border border-error/30 px-3 py-2 text-sm font-medium text-error"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
