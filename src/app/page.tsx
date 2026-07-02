import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

const metrics = [
  { value: "100k+", label: "pengguna aktif" },
  { value: "98%", label: "laporan akurat" },
  { value: "24/7", label: "akses kapan saja" },
];

const features = [
  {
    icon: ReceiptText,
    title: "Catat transaksi cepat",
    description: "Tambahkan pemasukan dan pengeluaran dalam hitungan detik lewat antarmuka yang simpel.",
  },
  {
    icon: ScanLine,
    title: "Scan struk otomatis",
    description: "Pindai struk dan biarkan SAKUKU mengubahnya menjadi catatan terorganisir.",
  },
  {
    icon: BarChart3,
    title: "Laporan real-time",
    description: "Pantau pola belanja, target tabungan, dan kondisi finansial Anda secara jelas.",
  },
  {
    icon: ShieldCheck,
    title: "Aman dan pribadi",
    description: "Data Anda tersimpan aman di akun personal dengan perlindungan yang nyaman dipakai.",
  },
];

const steps = [
  {
    title: "Daftar akun",
    description: "Buat akun dalam hitungan menit dan mulai mengatur uang Anda.",
  },
  {
    title: "Catat aktivitas",
    description: "Masukkan transaksi manual atau pindai struk langsung dari ponsel Anda.",
  },
  {
    title: "Pantau progres",
    description: "Lihat laporan bulanan, tren pengeluaran, dan target tabungan Anda.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,110,8,0.18),_transparent_25%),linear-gradient(135deg,_#f7fff7_0%,_#eef8f0_55%,_#f7faf7_100%)] px-4 py-5 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-full border border-primary/10 bg-surface-lowest/90 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">SAKUKU</p>
                <p className="text-xs text-on-surface-variant">Expense Tracker</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-on-surface-variant md:flex">
              <a href="#fitur" className="transition hover:text-primary">Fitur</a>
              <a href="#keunggulan" className="transition hover:text-primary">Keunggulan</a>
              <a href="#mulai" className="transition hover:text-primary">Mulai</a>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container hover:text-primary sm:px-4">
                Masuk
              </Link>
              <Link href="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
                Daftar
              </Link>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-[32px] border border-primary/10 bg-surface-lowest p-6 shadow-[0_25px_80px_rgba(0,0,0,0.08)] sm:p-8 lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <Sparkles size={16} />
                Baru • desain modern untuk mengelola uang dengan tenang
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-on-surface sm:text-5xl lg:text-6xl">
                  Kelola uang Anda dengan lebih tajam, cepat, dan terarah.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
                  SAKUKU membantu Anda mencatat transaksi, memantau tabungan, dan melihat laporan bulanan tanpa repot. Semua terasa ringkas, jelas, dan siap dipakai setiap hari.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                  Mulai Gratis
                  <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="rounded-full border border-outline-variant px-5 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container">
                  Sudah punya akun? Masuk
                </Link>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {metrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-surface-high bg-surface-container px-4 py-3">
                    <p className="text-lg font-semibold text-on-surface">{item.value}</p>
                    <p className="text-sm text-on-surface-variant">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-surface-high bg-gradient-to-br from-primary/95 via-primary to-primary-container p-4 shadow-inner sm:p-5">
              <div className="rounded-[24px] bg-surface-lowest p-4 text-on-surface shadow-xl sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Saldo bulan ini</p>
                    <p className="mt-2 text-3xl font-bold text-on-surface sm:text-4xl">Rp 3.250.000</p>
                  </div>
                  <div className="rounded-full bg-income/10 p-2 text-income">
                    <TrendingUp size={18} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface-container p-3">
                    <p className="text-sm text-on-surface-variant">Pemasukan</p>
                    <p className="mt-1 text-lg font-semibold text-on-surface">Rp 4.200.000</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container p-3">
                    <p className="text-sm text-on-surface-variant">Pengeluaran</p>
                    <p className="mt-1 text-lg font-semibold text-on-surface">Rp 950.000</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-surface-high bg-surface-low p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-on-surface">Aktivitas terbaru</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Live</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: "Belanja mingguan", amount: "- Rp 185.000", tone: "text-error" },
                      { label: "Gaji masuk", amount: "+ Rp 3.500.000", tone: "text-income" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface-lowest px-3 py-2 shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-on-surface">{item.label}</p>
                          <p className="text-xs text-on-surface-variant">Hari ini</p>
                        </div>
                        <p className={`text-sm font-semibold ${item.tone}`}>{item.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[24px] border border-surface-high bg-surface-lowest p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <h2 className="text-lg font-semibold text-on-surface">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section id="keunggulan" className="grid gap-6 rounded-[32px] border border-primary/10 bg-surface-lowest p-6 shadow-sm lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Kenapa orang suka SAKUKU</p>
            <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">Semua yang Anda butuhkan untuk mengontrol keuangan pribadi.</h2>
            <p className="text-base leading-7 text-on-surface-variant">
              Dari pencatatan harian hingga laporan bulanan, SAKUKU dibuat untuk membantu Anda mengambil keputusan finansial dengan lebih percaya diri.
            </p>
            <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              <BadgeCheck size={16} />
              Gratis untuk memulai, siap dipakai di berbagai perangkat.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "Mudah dipahami", text: "Antarmuka yang bersih untuk semua usia." },
              { title: "Cepat dipakai", text: "Catat transaksi tanpa banyak klik." },
              { title: "Terukur", text: "Lihat progres tabungan Anda secara visual." },
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] border border-surface-high bg-surface-container p-4">
                <h3 className="font-semibold text-on-surface">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mulai" className="rounded-[32px] border border-primary/10 bg-primary px-6 py-8 text-white shadow-sm sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-90">Siap mulai?</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Buat akun sekarang dan rasakan cara mudah mengontrol keuangan Anda.</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
                {steps.map((step) => (
                  <div key={step.title} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    {step.title}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-surface-container">
              Daftar Sekarang
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
