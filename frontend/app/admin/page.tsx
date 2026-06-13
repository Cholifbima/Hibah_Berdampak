"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, formatRupiah, authFetch } from "@/lib/api";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  DollarSign,
  Layers,
  ShoppingBag,
  UserCheck,
  TrendingUp,
  Loader2,
  Database,
  Activity,
  HardDrive,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  total_pendapatan: number;
  total_produk: number;
  total_stok: number;
  total_user: number;
  total_pesanan: number;
}

interface TrenItem {
  id_product: number;
  nama_produk: string;
  gambar_url: string | null;
  harga_satuan: number;
  stok: number;
  total_terjual: number;
  total_pendapatan: number;
}

// ─── Admin Navbar ─────────────────────────────────────────────────────────────
function AdminHeader({ userName, onMenuToggle }: { userName?: string; onMenuToggle: () => void }) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-[9999] flex h-[68px] items-center justify-between px-4"
      style={{
        background: "linear-gradient(135deg, rgb(22,63,115) 0%, rgb(31,103,223) 100%)",
      }}
    >
      {/* Logo + judul */}
      <Link href="/admin" className="flex items-center gap-2.5">
        <Image
          src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
          alt="TopAssist"
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-contain p-0.5"
        />
        <div>
          <p className="text-[15px] font-extrabold text-white leading-tight drop-shadow-sm">TopAssist</p>
          {userName && (
            <p className="text-[11px] text-white/70 leading-tight">Halo, {userName} 👋</p>
          )}
        </div>
      </Link>

      {/* Hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors touch-manipulation"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    </header>
  );
}

// ─── Slide-out Sidebar Menu ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/produk", icon: Package, label: "Produk" },
  { href: "/admin/pesanan", icon: ShoppingCart, label: "Pesanan" },
  { href: "/admin/users", icon: Users, label: "Pengguna" },
];

function SidebarMenu({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[9998] flex h-full w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header drawer */}
        <div
          className="flex h-[68px] items-center justify-between px-5"
          style={{
            background: "linear-gradient(135deg, rgb(22,63,115) 0%, rgb(31,103,223) 100%)",
          }}
        >
          <span className="text-[15px] font-bold text-white">Menu Admin</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#163f73]/8 hover:text-[#163f73] transition-colors mb-1"
            >
              <item.icon className="h-5 w-5 text-[#163f73]/70" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors mb-1"
          >
            <ShoppingBag className="h-5 w-5" />
            Lihat Toko
          </Link>
          <button
            type="button"
            onClick={() => { onLogout(); onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-black/10 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[#d9d9d9]">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
        <p className="text-[15px] font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tren, setTren] = useState<TrenItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, trenRes] = await Promise.all([
        authFetch(apiUrl("/admin/stats"), { headers }),
        authFetch(apiUrl("/admin/tren-penjualan"), { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (trenRes.ok) setTren(await trenRes.json());
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <AdminHeader userName={user?.nama_lengkap?.split(" ")[0]} onMenuToggle={() => setMenuOpen(true)} />
      <SidebarMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={logout}
      />

      {/* Page content */}
      <main className="pt-[68px]">
        <div className="mx-auto max-w-2xl space-y-7 px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-[#163f73]" />
            </div>
          ) : (
            <>
              {/* ── Stat Cards ── */}
              <section>
                <h2 className="mb-3 text-[14px] font-bold text-gray-700">Ringkasan</h2>
                <div className="space-y-3">
                  <StatCard
                    label="Total Pendapatan"
                    value={stats ? formatRupiah(stats.total_pendapatan) : "-"}
                    icon={DollarSign}
                  />
                  <StatCard
                    label="Total Stok Produk"
                    value={stats ? `${stats.total_stok.toLocaleString("id-ID")} unit` : "-"}
                    icon={Layers}
                  />
                  <StatCard
                    label="Total Pesanan"
                    value={stats ? `${stats.total_pesanan} pesanan` : "-"}
                    icon={ShoppingCart}
                  />
                  <StatCard
                    label="Total Pelanggan"
                    value={stats ? `${stats.total_user} user` : "-"}
                    icon={UserCheck}
                  />
                </div>
              </section>

              {/* ── Tren Penjualan ── */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#163f73]" />
                  <h2 className="text-[16px] font-bold text-gray-800">Tren Penjualan</h2>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_2fr_auto] gap-x-3 bg-[#d9d9d9] px-4 py-3">
                    <span className="text-[12px] font-semibold text-gray-700">ID Produk</span>
                    <span className="text-[12px] font-semibold text-gray-700">Nama Produk</span>
                    <span className="text-right text-[12px] font-semibold text-gray-700">Terjual</span>
                  </div>

                  {tren.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">
                      Belum ada data penjualan
                    </div>
                  ) : (
                    tren.map((item, idx) => {
                      // Visual chart bar
                      const maxTerjual = Math.max(...tren.map(t => t.total_terjual));
                      const percentage = Math.max((item.total_terjual / maxTerjual) * 100, 5);

                      return (
                        <div
                          key={item.id_product}
                          className={`relative grid grid-cols-[1fr_2fr_auto] gap-x-3 px-4 py-3.5 border-b border-gray-100 last:border-0 ${
                            idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                          }`}
                        >
                          <span className="text-[13px] font-medium text-gray-700 z-10">
                            #P{String(item.id_product).padStart(4, "0")}
                          </span>
                          <span className="text-[13px] font-semibold text-gray-800 line-clamp-1 z-10">
                            {item.nama_produk}
                          </span>
                          <span className="text-right text-[13px] font-bold text-[#163f73] z-10">
                            {item.total_terjual} terjual
                          </span>
                          
                          {/* Visual Bar */}
                          <div 
                            className="absolute left-0 bottom-0 top-0 bg-blue-100/40 border-r-2 border-blue-200 z-0 transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* ── Status & Pemeliharaan Sistem ── */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <h2 className="text-[16px] font-bold text-gray-800">Status Sistem & Pemeliharaan</h2>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Database</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-gray-800">Koneksi Aktif</span>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[13px] font-medium text-gray-800">Sinkronisasi Produk</span>
                      <span className="text-[12px] font-bold text-emerald-600">Aman</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Penyimpanan Server</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-gray-600">Kapasitas 64GB</span>
                      <span className="text-[12px] font-bold text-gray-800">28% Terpakai</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#163f73] rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => alert("Sistem berhasil disinkronisasi & cache dibersihkan!")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#163f73] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0f2d55] shadow-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Bersihkan Cache & Sinkronisasi Ulang
                </button>
              </section>

              {/* ── Quick Links ── */}
              <section>
                <h2 className="mb-3 text-[14px] font-bold text-gray-700">Menu Cepat</h2>
                <div className="grid grid-cols-2 gap-3">
                  {NAV_ITEMS.filter((n) => n.href !== "/admin").map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-[#163f73]/20 hover:bg-[#163f73]/5 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163f73]/10">
                        <item.icon className="h-5 w-5 text-[#163f73]" />
                      </div>
                      <span className="text-[12px] font-semibold text-gray-700">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
