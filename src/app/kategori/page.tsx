"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useCategoryStore } from "@/store/categoryStore";
import { useTransactionStore } from "@/store/transactionStore";
import { formatRupiah, getMonthRange } from "@/lib/formatters";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BottomNav } from "@/components/BottomNav";
import type { Category } from "@/types";

const PRESET_ICONS = [
  "Utensils",
  "Car",
  "ShoppingBag",
  "Clapperboard",
  "Zap",
  "HeartPulse",
  "Wallet",
  "Tag",
  "Shirt",
  "BookOpen",
  "Gift",
  "Home",
  "Plane",
  "Coffee",
  "Sparkles",
  "Dumbbell",
];

const PRESET_COLORS = [
  "#F4A261", // Orange
  "#7FB069", // Green
  "#9B5DE5", // Purple
  "#F15BB5", // Pink
  "#FEE440", // Yellow
  "#00BBF9", // Light Blue
  "#4361EE", // Blue
  "#A8A8A8", // Grey
  "#E63946", // Red
  "#457B9D", // Steel Blue
  "#2A9D8F", // Teal
  "#E76F51", // Burnt Orange
];

export default function KategoriScreen() {
  const router = useRouter();
  const categories = useCategoryStore((s) => s.categories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const transactions = useTransactionStore((s) => s.transactions);

  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("Tag");
  const [formColor, setFormColor] = useState("#F4A261");
  const [formLimit, setFormLimit] = useState("");

  const currentMonthExpenses = useMemo(() => {
    const { start, end } = getMonthRange(new Date());
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d >= start && d <= end;
    });
  }, [transactions]);

  const categoriesWithLimit = useMemo(() => {
    return categories
      .map((cat) => {
        const used = currentMonthExpenses
          .filter((t) => t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          ...cat,
          used,
        };
      })
      .filter((c) => c.monthlyLimit && c.monthlyLimit > 0);
  }, [categories, currentMonthExpenses]);

  const openAddModal = () => {
    setIsAdding(true);
    setEditingCategory(null);
    setFormName("");
    setFormIcon("Tag");
    setFormColor("#F4A261");
    setFormLimit("");
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setIsAdding(false);
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setFormLimit(cat.monthlyLimit ? cat.monthlyLimit.toString() : "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    const limitNum = parseInt(formLimit.replace(/\D/g, ""), 10);
    const monthlyLimit = isNaN(limitNum) || limitNum <= 0 ? undefined : limitNum;

    if (isAdding) {
      await addCategory({
        name: formName,
        icon: formIcon,
        color: formColor,
        monthlyLimit,
      });
    } else if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: formName,
        icon: formIcon,
        color: formColor,
        monthlyLimit,
      });
    }

    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!editingCategory) return;
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${editingCategory.name}"?`)) {
      await deleteCategory(editingCategory.id);
      setShowModal(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-6 pb-4 md:px-0">
        <button onClick={() => router.back()} className="md:hidden">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-lg font-bold text-primary md:text-2xl md:text-on-surface">Kelola Kategori</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 px-5 md:px-0">
        {/* Left Column: Grid Kategori */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => openEditModal(cat)}
                className="bg-surface-lowest rounded-card p-4 flex flex-col items-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-transform text-center w-full"
              >
                <CategoryIcon icon={cat.icon} color={cat.color} size="lg" />
                <span className="text-xs font-medium text-on-surface line-clamp-1">
                  {cat.name}
                </span>
              </button>
            ))}

            <button
              onClick={openAddModal}
              className="rounded-card border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 py-4 hover:bg-surface-container/20 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <Plus size={20} className="text-outline" />
              </div>
              <span className="text-xs text-outline text-center">Tambah Kategori</span>
            </button>
          </div>
        </div>

        {/* Right Column: Limit Anggaran */}
        <div className="mt-7 md:mt-0">
          <h2 className="font-bold text-on-surface mb-3">Limit Anggaran Bulan Ini</h2>
          {categoriesWithLimit.length > 0 ? (
            <div className="space-y-3">
              {categoriesWithLimit.map((cat) => {
                const limit = cat.monthlyLimit || 1;
                const percent = Math.min((cat.used / limit) * 100, 100);
                const isWarning = percent > 80;

                return (
                  <div key={cat.id} className="bg-surface-lowest rounded-card p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                        <span className="text-sm font-semibold text-on-surface">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        {formatRupiah(cat.used)} / {formatRupiah(limit)}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWarning ? "bg-error" : "bg-primary-container"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {isWarning && (
                      <p className="text-[10px] text-error mt-1 font-medium">
                        Pengeluaran telah melebihi 80% dari limit anggaran!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-lowest rounded-card p-5 text-center shadow-sm border border-dashed border-outline-variant">
              <p className="text-sm text-on-surface-variant">Belum ada limit anggaran.</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">
                Klik salah satu kategori di kiri untuk mengatur limit pengeluaran bulanan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center">
          <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 shadow-xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-on-surface text-lg">
                {isAdding ? "Tambah Kategori" : "Edit Kategori"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-on-surface-variant hover:text-on-surface"
              >
                Batal
              </button>
            </div>

            <div className="space-y-4">
              {/* Nama Kategori */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Belanja Bulanan"
                  className="w-full bg-surface-lowest border border-outline-variant rounded-card px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-outline-variant rounded-card bg-surface-lowest">
                  {PRESET_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setFormIcon(ico)}
                      className={`p-1 rounded-full flex items-center justify-center border-2 transition-all ${
                        formIcon === ico ? "border-primary bg-primary/10" : "border-transparent"
                      }`}
                    >
                      <CategoryIcon icon={ico} color={formColor} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                  Pilih Warna
                </label>
                <div className="grid grid-cols-6 gap-3 p-2 border border-outline-variant rounded-card bg-surface-lowest justify-items-center">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFormColor(col)}
                      className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center"
                      style={{
                        backgroundColor: col,
                        borderColor: formColor === col ? "var(--color-primary)" : "transparent",
                        boxShadow: formColor === col ? "0 0 0 2px white inset" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Limit Anggaran */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Limit Anggaran Bulanan (Opsional)
                </label>
                <div className="flex items-center gap-2 border border-outline-variant rounded-card px-4 py-3 bg-surface-lowest">
                  <span className="text-sm text-on-surface-variant">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formLimit ? Number(formLimit.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                    onChange={(e) => setFormLimit(e.target.value.replace(/\D/g, ""))}
                    placeholder="Tanpa limit"
                    className="flex-1 bg-transparent outline-none text-sm text-on-surface font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              {!isAdding && (
                <button
                  onClick={handleDelete}
                  className="flex-1 border border-error text-error font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!formName.trim()}
                className="flex-[2] bg-primary text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <Save size={16} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
