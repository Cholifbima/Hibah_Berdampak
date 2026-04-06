"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { formatRupiah, getApiBase } from "@/lib/api";
import { Package, Clock, Truck, CheckCircle, Search, ChevronRight, ShoppingBag, LogIn, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface OrderDetail {
  id_detail: number;
  id_product: number;
  kuantitas: number;
  harga_satuan_terekam: number;
  subtotal: number;
  product: {
    nama_produk: string;
    gambar_url: string | null;
  };
}

interface Order {
  id_order: number;
  kode_pesanan: string;
  total_pembayaran: number;
  status_pesanan: string;
  nama_penerima: string;
  jenis_pengiriman: string | null;
  nomor_resi: string | null;
  tanggal_pesanan: string;
  details: OrderDetail[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  PENDING: { label: "Menunggu Konfirmasi", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  DIKONFIRMASI: { label: "Dikonfirmasi", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Package },
  DIPROSES: { label: "Diproses", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", icon: Package },
  DIKIRIM: { label: "Dalam Pengiriman", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: Truck },
  SELESAI: { label: "Selesai", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle },
  DIBATALKAN: { label: "Dibatalkan", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: Clock },
};

function getStatusInfo(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
}

function StatusTimeline({ status }: { status: string }) {
  const steps = ["PENDING", "DIKONFIRMASI", "DIPROSES", "DIKIRIM", "SELESAI"];
  const currentIdx = steps.indexOf(status);
  const isCancelled = status === "DIBATALKAN";

  if (isCancelled)
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        <Clock className="h-4 w-4" /> Pesanan Dibatalkan
      </div>
    );

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const info = STATUS_CONFIG[step];
        const Icon = info.icon;
        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div className={`mx-1 h-0.5 w-5 sm:w-8 ${done ? "bg-[#163f73]" : "bg-gray-200"}`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                  done ? "border-[#163f73] bg-[#163f73] text-white" : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`whitespace-nowrap text-[10px] font-medium sm:text-xs ${done ? "text-[#163f73]" : "text-gray-400"}`}>
                {info.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ManualTrackingTab() {
  const [resi, setResi] = useState("");
  const [courier, setCourier] = useState("jne");
  const [result, setResult] = useState<string | null>(null);

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!resi.trim()) return;
    setResult(
      `Fitur tracking resi otomatis akan segera tersedia.\n\nSementara itu, silakan cek resi "${resi}" melalui website resmi kurir:\n\n` +
        `• JNE: https://www.jne.co.id/id/tracking/trace\n` +
        `• J&T: https://www.jet.co.id/track\n` +
        `• SiCepat: https://www.sicepat.com/checkAwb\n` +
        `• AnterAja: https://anteraja.id/tracking`
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-[#163f73]">Cek Resi Manual</h2>
      <p className="mt-1 text-sm text-gray-500">Masukkan nomor resi dari kurir untuk melacak pengiriman Anda.</p>

      <form onSubmit={handleTrack} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Kurir</label>
          <select
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#163f73] focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none"
          >
            <option value="jne">JNE</option>
            <option value="jnt">J&T Express</option>
            <option value="sicepat">SiCepat</option>
            <option value="anteraja">AnterAja</option>
            <option value="pos">POS Indonesia</option>
            <option value="tiki">TIKI</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Nomor Resi</label>
          <input
            type="text"
            value={resi}
            onChange={(e) => setResi(e.target.value)}
            placeholder="Masukkan nomor resi"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#163f73] focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#163f73] py-3.5 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors"
        >
          <Search className="h-4 w-4" />
          Lacak Pengiriman
        </button>
      </form>

      {result && (
        <div className="mt-4 rounded-xl bg-blue-50 p-4">
          <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700 sm:text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusInfo = getStatusInfo(order.status_pesanan);
  const StatusIcon = statusInfo.icon;
  const firstProduct = order.details[0];
  const extraCount = order.details.length - 1;

  return (
    <Link
      href={`/pesanan/${order.id_order}`}
      className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#163f73]">{order.kode_pesanan}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(order.tanggal_pesanan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
          {firstProduct?.product.gambar_url ? (
            <Image src={firstProduct.product.gambar_url} alt={firstProduct.product.nama_produk} fill sizes="56px" className="object-contain p-1" />
          ) : (
            <div className="flex h-full items-center justify-center text-lg">🛍️</div>
          )}
        </div>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-[#1a1a1a] line-clamp-1">{firstProduct?.product.nama_produk}</p>
          <p className="text-xs text-gray-500">
            {firstProduct?.kuantitas} pcs
            {extraCount > 0 && ` +${extraCount} produk lainnya`}
          </p>
        </div>
        <p className="shrink-0 text-sm font-extrabold text-[#163f73]">{formatRupiah(order.total_pembayaran)}</p>
      </div>

      {order.nomor_resi && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Truck className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-600">
            {order.jenis_pengiriman && <span className="font-semibold">{order.jenis_pengiriman} — </span>}
            {order.nomor_resi}
          </span>
        </div>
      )}
    </Link>
  );
}

export default function PesananPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"pesanan" | "manual">("pesanan");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/orders/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (token) fetchOrders();
    else setLoading(false);
  }, [token, fetchOrders]);

  const filtered = filterStatus === "SEMUA" ? orders : orders.filter((o) => o.status_pesanan === filterStatus);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-20 bg-gradient-to-r from-[#1f67df] to-[#163a78]">
          <Navbar />
        </div>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#163f73]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-20 bg-gradient-to-r from-[#1f67df] to-[#163a78]">
        <Navbar />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-extrabold text-[#163f73] sm:text-3xl">Pesanan Saya</h1>
        <p className="mt-1 text-sm text-gray-500">Lacak dan kelola semua pesanan Anda di sini.</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab("pesanan")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              tab === "pesanan" ? "bg-[#163f73] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Package className="h-4 w-4" />
            Pesanan Saya
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              tab === "manual" ? "bg-[#163f73] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Search className="h-4 w-4" />
            Cek Resi Manual
          </button>
        </div>

        {tab === "manual" ? (
          <div className="mt-6">
            <ManualTrackingTab />
          </div>
        ) : !user ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <LogIn className="h-16 w-16 text-[#163f73]/20" />
            <h2 className="mt-4 text-lg font-bold text-[#163f73]">Login untuk Melihat Pesanan</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Anda perlu login terlebih dahulu untuk melihat riwayat pesanan Anda.
            </p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#163f73] px-8 py-3 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </div>
        ) : (
          <>
            {/* Filter */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {["SEMUA", "PENDING", "DIKONFIRMASI", "DIPROSES", "DIKIRIM", "SELESAI"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    filterStatus === s ? "bg-[#163f73] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {s === "SEMUA" ? "Semua" : (STATUS_CONFIG[s]?.label || s)}
                </button>
              ))}
            </div>

            {/* Order list */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#163f73]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-10 flex flex-col items-center text-center">
                <ShoppingBag className="h-16 w-16 text-[#163f73]/20" />
                <h2 className="mt-4 text-lg font-bold text-[#163f73]">
                  {filterStatus === "SEMUA" ? "Belum Ada Pesanan" : `Tidak Ada Pesanan ${STATUS_CONFIG[filterStatus]?.label || filterStatus}`}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {filterStatus === "SEMUA"
                    ? "Pesanan Anda akan muncul di sini setelah checkout."
                    : "Coba filter lain atau lihat semua pesanan."}
                </p>
                {filterStatus === "SEMUA" && (
                  <Link href="/toko" className="mt-6 inline-flex items-center rounded-2xl bg-[#163f73] px-8 py-3 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors">
                    Belanja Sekarang
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {filtered.map((order) => (
                  <OrderCard key={order.id_order} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
