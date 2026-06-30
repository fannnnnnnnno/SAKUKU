"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Pencil } from "lucide-react";
import { useCategoryStore } from "@/store/categoryStore";
import { useTransactionStore } from "@/store/transactionStore";
import type { TransactionType } from "@/types";

interface ScanResult {
  merchant: string;
  total: number;
  date: string;
  rawText: string;
}

export default function HasilScanScreen() {
  const router = useRouter();
  const categories = useCategoryStore((s) => s.categories);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>("expense");

  const [data, setData] = useState<ScanResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("scan-result");
    if (!raw) {
      router.replace("/scan");
      return;
    }
    setData(JSON.parse(raw));
  }, [router]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (!data) return null;

  const handleSave = async () => {
    if (!categoryId) {
      alert("Pilih kategori terlebih dahulu");
      return;
    }

    const transactionDate = new Date(data.date);
    const now = new Date();
    transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    await addTransaction({
      amount: data.total,
      type,
      categoryId,
      note: data.merchant,
      date: transactionDate.toISOString(),
      source: "scan",
    });

    sessionStorage.removeItem("scan-result");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-surface pb-10 md:pt-6">
      <div className="max-w-xl mx-auto bg-surface-lowest md:shadow-md md:rounded-2xl overflow-hidden">
        <div className="bg-primary px-5 pt-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </button>
            <h1 className="text-lg font-bold text-white">Hasil Scan</h1>
          </div>
        </div>

        <div className="px-5 pb-8 mt-5">
          <p className="text-sm text-on-surface-variant text-center mb-4">
            Mohon periksa kembali hasil scan
          </p>

        {/* Toggle Tipe Transaksi */}
        <div className="flex bg-surface-container rounded-full p-1 mb-5">
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

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-on-surface block mb-1.5">
              Merchant
            </label>
            <div className="flex items-center gap-2 border border-outline-variant rounded-card px-4 py-3">
              <input
                type="text"
                value={data.merchant}
                onChange={(e) => setData({ ...data, merchant: e.target.value })}
                className="flex-1 bg-transparent outline-none text-on-surface"
                placeholder="Nama toko/merchant"
              />
              <Pencil size={16} className="text-on-surface-variant" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-on-surface block mb-1.5">
              Tanggal
            </label>
            <div className="border border-outline-variant rounded-card px-4 py-3">
              <input
                type="date"
                value={data.date.slice(0, 10)}
                onChange={(e) =>
                  setData({ ...data, date: new Date(e.target.value).toISOString() })
                }
                className="w-full bg-transparent outline-none text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-on-surface block mb-1.5">
              Total
            </label>
            <div className="flex items-center gap-2 border border-outline-variant rounded-card px-4 py-3">
              <span className="text-on-surface-variant">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={data.total.toLocaleString("id-ID")}
                onChange={(e) =>
                  setData({
                    ...data,
                    total: parseInt(e.target.value.replace(/\D/g, ""), 10) || 0,
                  })
                }
                className="flex-1 bg-transparent outline-none font-bold text-on-surface"
              />
              <Pencil size={16} className="text-on-surface-variant" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-on-surface block mb-1.5">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    categoryId === cat.id
                      ? type === "expense"
                        ? "bg-error text-white border-error"
                        : "bg-primary-container text-white border-primary-container"
                      : "border-outline-variant text-on-surface hover:bg-surface-container/35"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-8 bg-primary text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Simpan
        </button>
      </div>
      </div>
    </main>
  );
}
