"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCategoryStore } from "@/store/categoryStore";
import { useTransactionStore } from "@/store/transactionStore";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { TransactionType } from "@/types";

export default function TambahTransaksiScreen() {
  const router = useRouter();
  const categories = useCategoryStore((s) => s.categories);
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickCategories = categories.slice(0, 4);

  const handleSubmit = async () => {
    const numericAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (!numericAmount || numericAmount <= 0) {
      setError("Masukkan nominal yang valid");
      return;
    }
    if (numericAmount > 999999999) {
      setError("Nominal terlalu besar");
      return;
    }
    if (!categoryId) {
      setError("Pilih kategori terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const transactionDate = new Date(date);
    const now = new Date();
    transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    try {
      await addTransaction({
        amount: numericAmount,
        type,
        categoryId,
        note: note || undefined,
        date: transactionDate.toISOString(),
        source: "manual",
      });

      router.push("/dashboard");
    } catch {
      setError("Gagal menyimpan transaksi");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface pb-10 md:pt-6">
      <div className="max-w-xl mx-auto bg-surface-lowest md:shadow-md md:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-5 pt-6 pb-5 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </button>
          <h1 className="text-lg font-bold text-white">Tambah Transaksi</h1>
        </div>

        <div className="px-5 pb-8">
          {/* Toggle */}
          <div className="flex bg-surface-container rounded-full p-1 mt-5">
            <button
              onClick={() => setType("expense")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                type === "expense" ? "bg-error text-white" : "text-on-surface-variant"
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setType("income")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                type === "income" ? "bg-primary-container text-white" : "text-on-surface-variant"
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount Input */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant mb-2">Masukkan Nominal</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-on-surface">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount ? Number(amount.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-4xl font-bold text-on-surface bg-transparent outline-none text-center w-48 placeholder:text-outline-variant"
              />
            </div>
            <div className="h-px bg-outline-variant mt-2 mx-8" />
          </div>

          {/* Kategori */}
          <button
            onClick={() => setShowCategoryModal(true)}
            className="w-full mt-8 bg-surface-lowest rounded-card p-4 flex items-center gap-3 shadow-sm border border-surface-high"
          >
            {categoryId ? (
              <CategoryIcon
                icon={categories.find((c) => c.id === categoryId)?.icon || "Circle"}
                color={categories.find((c) => c.id === categoryId)?.color || "#A8A8A8"}
                size="sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-surface-container" />
            )}
            <div className="flex-1 text-left">
              <p className="text-xs text-on-surface-variant">Kategori</p>
              <p className="text-sm font-medium text-on-surface">
                {categoryId
                  ? categories.find((c) => c.id === categoryId)?.name
                  : "Pilih Kategori"}
              </p>
            </div>
          </button>

          {/* Tanggal */}
          <div className="mt-3 bg-surface-lowest rounded-card p-4 flex items-center gap-3 shadow-sm border border-surface-high">
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant mb-1">Tanggal</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm font-medium text-on-surface bg-transparent outline-none w-full"
              />
            </div>
          </div>

          {/* Catatan */}
          <div className="mt-3 bg-surface-lowest rounded-card p-4 shadow-sm border border-surface-high">
            <p className="text-xs text-on-surface-variant mb-1">Catatan (Opsional)</p>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan rincian..."
              className="text-sm text-on-surface bg-transparent outline-none w-full placeholder:text-outline-variant"
            />
          </div>

          {/* Quick Categories */}
          <p className="text-sm font-semibold text-on-surface mt-6 mb-3">
            Cepat Pilih Kategori
          </p>
          <div className="flex gap-4">
            {quickCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`rounded-full ${
                    categoryId === cat.id ? "ring-2 ring-primary-container ring-offset-2" : ""
                  }`}
                >
                  <CategoryIcon icon={cat.icon} color={cat.color} size="lg" />
                </div>
                <span className="text-xs text-on-surface-variant">{cat.name}</span>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-error mt-4 text-center">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-8 bg-primary text-white font-semibold py-4 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center">
          <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-on-surface text-lg">Pilih Kategori</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-sm text-on-surface-variant hover:text-on-surface"
              >
                Batal
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pb-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setShowCategoryModal(false);
                  }}
                  className={`bg-surface-lowest rounded-card p-3 flex flex-col items-center gap-2 shadow-sm border-2 transition-all ${
                    categoryId === cat.id
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <CategoryIcon icon={cat.icon} color={cat.color} size="md" />
                  <span className="text-xs font-medium text-on-surface text-center line-clamp-1">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
