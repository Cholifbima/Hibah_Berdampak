"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, formatRupiah } from "@/lib/api";
import {
  Menu, X, LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  ShoppingBag, Search, Filter, Loader2, ChevronDown,
  Clock, CheckCircle, Truck, XCircle,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface OrderItem {
  id_detail: number;
  id_product: number;
  kuantitas: number;
  subtotal: number;
  product: { nama_produk: string; gambar_url: string | null };
}

interface Order {
  id_order: number;
  kode_pesanan: string;
  total_pembayaran: number;
  status_pesanan: string;
  nama_penerima: string;
  alamat_pengiriman: string;
  no_telepon: string;
  catatan: string;
  tanggal_pesanan: string;
  details: OrderItem[];
  user: { nama_lengkap: string; username: string; email: string };
}

// ─── Shared Admin UI ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/produk", icon: Package, label: "Produk" },
  { href: "/admin/pesanan", icon: ShoppingCart, label: "Pesanan" },
  { href: "/admin/users", icon: Users, label: "Pengguna" },
];

function AdminHeader({ title, onMenuToggle }: { title: string; onMenuToggle: () => void }) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-[9999] flex h-[68px] items-center justify-between px-4"
      style={{ background: "linear-gradient(135deg, rgb(22,63,115) 0%, rgb(31,103,223) 100%)" }}
    >
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg" alt="TopAssist" width={36} height={36} className="h-9 w-9 rounded-full object-contain p-0.5" />
          <span className="text-[16px] font-extrabold text-white drop-shadow-sm">TopAssist</span>
        </Link>
        <span className="hidden text-white/50 sm:inline">·</span>
        <span className="hidden text-[14px] font-semibold text-white/80 sm:inline">{title}</span>
      </div>
      <button type="button" onClick={onMenuToggle} className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors">
        <Menu className="h-6 w-6" />
      </button>
    </header>
  );
}

function SidebarMenu({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed right-0 top-0 z-[9998] flex h-full w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[68px] items-center justify-between px-5" style={{ background: "linear-gradient(135deg, rgb(22,63,115) 0%, rgb(31,103,223) 100%)" }}>
          <span className="text-[15px] font-bold text-white">Menu Admin</span>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#163f73]/8 hover:text-[#163f73] transition-colors mb-1">
              <item.icon className="h-5 w-5 text-[#163f73]/70" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors mb-1">
            <ShoppingBag className="h-5 w-5" />Lihat Toko
          </Link>
          <button type="button" onClick={() => { onLogout(); onClose(); }} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-5 w-5" />Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_LIST = ["SEMUA", "PENDING", "DIKONFIRMASI", "DIPROSES", "DIKIRIM", "SELESAI", "DIBATALKAN"];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:      { label: "Pending",      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",   icon: Clock },
  DIKONFIRMASI: { label: "Dikonfirmasi", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     icon: CheckCircle },
  DIPROSES:     { label: "Diproses",     color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: Package },
  DIKIRIM:      { label: "Dikirim",      color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Truck },
  SELESAI:      { label: "Selesai",      color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: CheckCircle },
  DIBATALKAN:   { label: "Dibatalkan",   color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: XCircle },
};

const NEXT_STATUS: Record<string, string[]> = {
  PENDING:      ["DIKONFIRMASI", "DIBATALKAN"],
  DIKONFIRMASI: ["DIPROSES", "DIBATALKAN"],
  DIPROSES:     ["DIKIRIM"],
  DIKIRIM:      ["SELESAI"],
  SELESAI:      [],
  DIBATALKAN:   [],
};

// ─── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order, token, onUpdate }: { order: Order; token: string; onUpdate: (updated: Order) => void }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CFG[order.status_pesanan] ?? STATUS_CFG.PENDING;
  const StatusIcon = cfg.icon;
  const nextStatuses = NEXT_STATUS[order.status_pesanan] ?? [];

  async function handleUpdate(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(apiUrl(`/orders/${order.id_order}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status_pesanan: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
    } catch (err) { console.error(err); }
    setUpdating(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <button type="button" onClick={() => setOpen((p) => !p)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-gray-900">{order.kode_pesanan}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="h-3 w-3" />{cfg.label}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-gray-500 truncate">{order.nama_penerima} · {order.user?.email}</p>
          <p className="text-[12px] font-semibold text-[#163f73]">{formatRupiah(order.total_pembayaran)}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          {/* Info baris */}
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div><span className="text-gray-500">Tanggal:</span> <span className="font-medium text-gray-800">{new Date(order.tanggal_pesanan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
            <div><span className="text-gray-500">Telepon:</span> <span className="font-medium text-gray-800">{order.no_telepon || "-"}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Alamat:</span> <span className="font-medium text-gray-800">{order.alamat_pengiriman}</span></div>
            {order.catatan && <div className="col-span-2"><span className="text-gray-500">Catatan:</span> <span className="font-medium text-gray-800">{order.catatan}</span></div>}
          </div>

          {/* Detail produk */}
          <div className="space-y-2">
            {order.details?.map((d) => (
              <div key={d.id_detail} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#e9f4ff]">
                  {d.product.gambar_url
                    ? <Image src={d.product.gambar_url} alt={d.product.nama_produk} fill sizes="40px" className="object-contain p-0.5" />
                    : <div className="flex h-full items-center justify-center text-base">🛍️</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-gray-800">{d.product.nama_produk}</p>
                  <p className="text-[11px] text-gray-500">{d.kuantitas} pcs · {formatRupiah(d.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Update status */}
          {nextStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {nextStatuses.map((s) => {
                const c = STATUS_CFG[s];
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdate(s)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#163f73] bg-[#163f73] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#0f2d55] transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <c.icon className="h-3 w-3" />}
                    Tandai {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminPesananPage() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/admin/orders"), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setOrders(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function handleUpdate(updated: Order) {
    setOrders((prev) => prev.map((o) => o.id_order === updated.id_order ? { ...o, ...updated } : o));
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "SEMUA" || o.status_pesanan === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o.kode_pesanan.toLowerCase().includes(q) || o.nama_penerima.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <AdminHeader title="Pesanan" onMenuToggle={() => setMenuOpen(true)} />
      <SidebarMenu open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />

      <main className="pt-[68px]">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesanan, nama, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-3 text-sm text-gray-700 focus:border-[#163f73] focus:outline-none focus:ring-1 focus:ring-[#163f73]/20 appearance-none"
              >
                {STATUS_LIST.map((s) => <option key={s} value={s}>{s === "SEMUA" ? "Semua Status" : STATUS_CFG[s]?.label ?? s}</option>)}
              </select>
            </div>
          </div>

          {/* Count */}
          <p className="text-[12px] text-gray-500">{filtered.length} pesanan ditemukan</p>

          {/* Orders */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-10 w-10 animate-spin text-[#163f73]" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-white px-4 py-12 text-center shadow-sm">
              <ShoppingCart className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-500">Tidak ada pesanan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((o) => (
                <OrderCard key={o.id_order} order={o} token={token!} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
