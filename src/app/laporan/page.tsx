"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { formatRupiah, formatMonthYear, getMonthRange } from "@/lib/formatters";
import { BottomNav } from "@/components/BottomNav";
import type { Transaction } from "@/types";

// Custom tooltip untuk bar chart
const BarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-lowest border border-surface-high rounded-card px-3 py-2 shadow-md text-xs">
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function LaporanScreen() {
  const router = useRouter();
  const transactions = useTransactionStore((s) => s.transactions);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", note: "", date: "", categoryId: "" });

  const changeMonth = (delta: number) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + delta);
    setCurrentMonth(next);
  };

  // Data bulan aktif
  const { incomeBreakdown, expenseBreakdown, totalIncome, totalExpense, monthlyTransactions } = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth);

    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    const monthlyTransactions = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const buildBreakdown = (type: "income" | "expense") => {
      const byCategory: Record<string, number> = {};
      for (const tx of filtered.filter((t) => t.type === type)) {
        byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount;
      }
      const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
      return {
        breakdown: Object.entries(byCategory)
          .map(([categoryId, amount]) => {
            const cat = categories.find((c) => c.id === categoryId);
            return {
              name: cat?.name || "Lainnya",
              value: amount,
              color: cat?.color || "#A8A8A8",
              percent: total > 0 ? Math.round((amount / total) * 100) : 0,
            };
          })
          .sort((a, b) => b.value - a.value),
        total,
      };
    };

    const { breakdown: incomeBreakdown, total: totalIncome } = buildBreakdown("income");
    const { breakdown: expenseBreakdown, total: totalExpense } = buildBreakdown("expense");

    return { incomeBreakdown, expenseBreakdown, totalIncome, totalExpense, monthlyTransactions };
  }, [transactions, categories, currentMonth]);

  // Data 6 bulan terakhir untuk bar chart
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentMonth);
      d.setMonth(d.getMonth() - (5 - i));
      const { start, end } = getMonthRange(d);

      const filtered = transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= start && td <= end;
      });

      const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      return {
        bulan: d.toLocaleDateString("id-ID", { month: "short" }),
        Pemasukan: income,
        Pengeluaran: expense,
      };
    });
  }, [transactions, currentMonth]);

  // Combined donut data (pemasukan + pengeluaran dalam 1 chart)
  const combinedDonutData = useMemo(() => {
    const result = [];
    if (totalIncome > 0) result.push({ name: "Pemasukan", value: totalIncome, color: "#00AA13" });
    if (totalExpense > 0) result.push({ name: "Pengeluaran", value: totalExpense, color: "#BA1A1A" });
    return result;
  }, [totalIncome, totalExpense]);

  const saldo = totalIncome - totalExpense;
  const hasData = totalIncome > 0 || totalExpense > 0;

  // Edit handlers
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
    if (!editForm.date || isNaN(amount) || amount <= 0 || !editForm.categoryId) return;
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

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-6 pb-4 md:px-0">
        <button onClick={() => router.back()} className="md:hidden">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-lg font-bold text-primary md:text-2xl md:text-on-surface">Laporan</h1>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center md:justify-start gap-4 px-5 md:px-0 mb-6">
        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-surface-container rounded-full">
          <ChevronLeft size={20} className="text-on-surface" />
        </button>
        <span className="font-semibold text-on-surface capitalize min-w-[140px] text-center">
          {formatMonthYear(currentMonth)}
        </span>
        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-surface-container rounded-full">
          <ChevronRight size={20} className="text-on-surface" />
        </button>
      </div>

      <div className="px-5 md:px-0 space-y-6">

        {/* === DIAGRAM UTAMA: Donut gabungan + ringkasan === */}
        <div className="bg-surface-lowest rounded-card p-5 shadow-sm">
          <h3 className="font-bold text-on-surface mb-4">Ringkasan Bulan Ini</h3>

          {!hasData ? (
            <p className="text-sm text-on-surface-variant text-center py-8">
              Belum ada data untuk bulan ini.
            </p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Donut gabungan pemasukan + pengeluaran */}
              <div className="relative w-full md:w-64 h-52 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={combinedDonutData}
                      dataKey="value"
                      innerRadius={58}
                      outerRadius={90}
                      paddingAngle={3}
                      isAnimationActive={false}
                    >
                      {combinedDonutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label: Saldo */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[11px] text-on-surface-variant">Saldo</p>
                  <p className={`text-base font-bold ${saldo >= 0 ? "text-primary-container" : "text-error"}`}>
                    {formatRupiah(saldo)}
                  </p>
                </div>
              </div>

              {/* Ringkasan kanan */}
              <div className="flex-1 w-full space-y-3">
                {/* Pemasukan */}
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-card">
                  <div className="w-3 h-3 rounded-full bg-primary-container flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-on-surface-variant">Pemasukan</p>
                    <p className="text-sm font-bold text-primary-container">{formatRupiah(totalIncome)}</p>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {combinedDonutData.length > 0 && totalIncome + totalExpense > 0
                      ? Math.round((totalIncome / (totalIncome + totalExpense)) * 100)
                      : 0}%
                  </p>
                </div>

                {/* Pengeluaran */}
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-card">
                  <div className="w-3 h-3 rounded-full bg-error flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-on-surface-variant">Pengeluaran</p>
                    <p className="text-sm font-bold text-error">{formatRupiah(totalExpense)}</p>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {combinedDonutData.length > 0 && totalIncome + totalExpense > 0
                      ? Math.round((totalExpense / (totalIncome + totalExpense)) * 100)
                      : 0}%
                  </p>
                </div>

                {/* Saldo */}
                <div className={`flex items-center gap-3 p-3 rounded-card ${saldo >= 0 ? "bg-primary/10" : "bg-error-container"}`}>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${saldo >= 0 ? "bg-primary" : "bg-error"}`} />
                  <div className="flex-1">
                    <p className="text-xs text-on-surface-variant">Saldo</p>
                    <p className={`text-sm font-bold ${saldo >= 0 ? "text-primary" : "text-error"}`}>
                      {formatRupiah(saldo)}
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {saldo >= 0 ? "Surplus" : "Defisit"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === TREN 6 BULAN: Bar chart gabungan === */}
        <div className="bg-surface-lowest rounded-card p-5 shadow-sm">
          <h3 className="font-bold text-on-surface mb-4">Tren 6 Bulan Terakhir</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E2E1" vertical={false} />
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 11, fill: "#6D7B67" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#F0EDED" }} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => <span style={{ color: "#3E4A39" }}>{value}</span>}
                />
                <Bar dataKey="Pemasukan" fill="#00AA13" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="Pengeluaran" fill="#BA1A1A" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === PROPORSI PER KATEGORI (2 kolom side by side) === */}
        {hasData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proporsi Pengeluaran */}
            {expenseBreakdown.length > 0 && (
              <div className="bg-surface-lowest rounded-card p-5 shadow-sm">
                <h3 className="font-bold text-on-surface mb-3 text-sm">
                  Proporsi Pengeluaran
                </h3>
                <div className="relative h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="value"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                        isAnimationActive={false}
                      >
                        {expenseBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-on-surface-variant">Total</p>
                    <p className="text-xs font-bold text-error">{formatRupiah(totalExpense)}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {expenseBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-on-surface">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-on-surface">{formatRupiah(item.value)}</span>
                        <span className="text-[10px] text-on-surface-variant w-8 text-right">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proporsi Pemasukan */}
            {incomeBreakdown.length > 0 && (
              <div className="bg-surface-lowest rounded-card p-5 shadow-sm">
                <h3 className="font-bold text-on-surface mb-3 text-sm">
                  Proporsi Pemasukan
                </h3>
                <div className="relative h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeBreakdown}
                        dataKey="value"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                        isAnimationActive={false}
                      >
                        {incomeBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-on-surface-variant">Total</p>
                    <p className="text-xs font-bold text-primary-container">{formatRupiah(totalIncome)}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {incomeBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-on-surface">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-on-surface">{formatRupiah(item.value)}</span>
                        <span className="text-[10px] text-on-surface-variant w-8 text-right">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === DAFTAR TRANSAKSI + EDIT === */}
        <div className="bg-surface-lowest rounded-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Transaksi Bulan Ini</h3>
            <span className="text-xs text-on-surface-variant">{monthlyTransactions.length} item</span>
          </div>

          {monthlyTransactions.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-4">Belum ada transaksi.</p>
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
                              onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            />
                          </label>
                          <label className="text-xs text-on-surface-variant">
                            Kategori
                            <select
                              value={editForm.categoryId}
                              onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </label>
                          <label className="text-xs text-on-surface-variant md:col-span-2">
                            Catatan
                            <input
                              type="text"
                              value={editForm.note}
                              onChange={(e) => setEditForm((p) => ({ ...p, note: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            />
                          </label>
                          <label className="text-xs text-on-surface-variant md:col-span-2">
                            Tanggal
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                              className="mt-1 w-full rounded-full border border-outline-variant px-3 py-2 text-sm text-on-surface"
                            />
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">Simpan</button>
                          <button onClick={cancelEdit} className="rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface">Batal</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-semibold ${tx.type === "income" ? "text-primary-container" : "text-error"}`}>
                              {tx.type === "income" ? "+" : "-"} {formatRupiah(tx.amount)}
                            </p>
                            <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] text-on-surface-variant">
                              {category?.name || "Lainnya"}
                            </span>
                          </div>
                          {tx.note && <p className="mt-1 text-sm text-on-surface-variant">{tx.note}</p>}
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(tx)} className="flex items-center gap-1 rounded-full border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface">
                            <Pencil size={12} /> Edit
                          </button>
                          <button onClick={() => handleDelete(tx.id)} className="flex items-center gap-1 rounded-full border border-error/30 px-3 py-1.5 text-xs font-medium text-error">
                            <Trash2 size={12} /> Hapus
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
