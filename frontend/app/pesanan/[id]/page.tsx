"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { formatRupiah, getApiBase } from "@/lib/api";
import {
  ArrowLeft, Package, Clock, Truck, CheckCircle, MapPin, Phone,
  User, FileText, Loader2, Edit3, Save, X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface OrderDetail {
  id_detail: number;
  id_product: number;
  kuantitas: number;
  harga_satuan_terekam: number;
  subtotal: number;
  product: { id_product: number; nama_produk: string; gambar_url: string | null };
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
  jenis_pengiriman: string | null;
  nomor_resi: string | null;
  tanggal_pesanan: string;
  updated_at: string;
  details: OrderDetail[];
}

const STATUS_STEPS = ["PENDING", "DIKONFIRMASI", "DIPROSES", "DIKIRIM", "SELESAI"];
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Menunggu Konfirmasi", color: "text-amber-600", icon: Clock },
  DIKONFIRMASI: { label: "Dikonfirmasi", color: "text-blue-600", icon: Package },
  DIPROSES: { label: "Diproses", color: "text-indigo-600", icon: Package },
  DIKIRIM: { label: "Dalam Pengiriman", color: "text-purple-600", icon: Truck },
  SELESAI: { label: "Selesai", color: "text-green-600", icon: CheckCircle },
  DIBATALKAN: { label: "Dibatalkan", color: "text-red-600", icon: Clock },
};

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  if (status === "DIBATALKAN") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        <Clock className="h-4 w-4" /> Pesanan Dibatalkan
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const info = STATUS_CONFIG[step];
        const Icon = info.icon;
        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            {i > 0 && (
              <div className={`absolute h-0.5 w-full ${done ? "bg-[#163f73]" : "bg-gray-200"}`} />
            )}
            <div
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                done ? "border-[#163f73] bg-[#163f73] text-white" : "border-gray-200 bg-white text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className={`mt-1.5 text-center text-[10px] font-medium leading-tight sm:text-xs ${done ? "text-[#163f73]" : "text-gray-400"}`}>
              {info.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingResi, setEditingResi] = useState(false);
  const [resiInput, setResiInput] = useState("");
  const [courierInput, setCourierInput] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!token || !params.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(res.status === 404 ? "Pesanan tidak ditemukan" : "Gagal memuat pesanan");
        return;
      }
      const data = await res.json();
      setOrder(data);
      setResiInput(data.nomor_resi || "");
      setCourierInput(data.jenis_pengiriman || "");
    } catch {
      setError("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [token, params.id]);

  useEffect(() => {
    if (!authLoading) fetchOrder();
  }, [authLoading, fetchOrder]);

  async function handleSaveResi() {
    if (!token || !order) return;
    setSaving(true);
    try {
      const res = await fetch(`${getApiBase()}/api/orders/${order.id_order}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nomor_resi: resiInput, jenis_pengiriman: courierInput || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setEditingResi(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-20 bg-gradient-to-r from-[#1f67df] to-[#163a78]"><Navbar /></div>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#163f73]" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-20 bg-gradient-to-r from-[#1f67df] to-[#163a78]"><Navbar /></div>
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <Package className="mx-auto h-16 w-16 text-[#163f73]/20" />
          <h2 className="mt-4 text-lg font-bold text-[#163f73]">{error || "Pesanan tidak ditemukan"}</h2>
          <Link href="/pesanan" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#163f73] px-8 py-3 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status_pesanan] || STATUS_CONFIG.PENDING;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-20 bg-gradient-to-r from-[#1f67df] to-[#163a78]"><Navbar /></div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <button onClick={() => router.push("/pesanan")} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[#163f73] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Pesanan
        </button>

        {/* Header */}
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-[#163f73] sm:text-2xl">{order.kode_pesanan}</h1>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(order.tanggal_pesanan).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.color}`}>
              <statusInfo.icon className="h-3.5 w-3.5" />
              {statusInfo.label}
            </span>
          </div>

          <div className="mt-6">
            <StatusTimeline status={order.status_pesanan} />
          </div>
        </div>

        {/* Shipping info */}
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#163f73]">
            <Truck className="h-5 w-5" /> Informasi Pengiriman
          </h2>

          {/* Resi section */}
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Nomor Resi</span>
              {!editingResi && (
                <button onClick={() => setEditingResi(true)} className="flex items-center gap-1 text-xs font-semibold text-[#163f73] hover:underline">
                  <Edit3 className="h-3.5 w-3.5" /> {order.nomor_resi ? "Ubah" : "Tambahkan Resi"}
                </button>
              )}
            </div>

            {editingResi ? (
              <div className="mt-3 space-y-3">
                <select
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#163f73] focus:ring-1 focus:ring-[#163f73]/20 focus:outline-none"
                >
                  <option value="">Pilih Kurir</option>
                  <option value="JNE">JNE</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="SiCepat">SiCepat</option>
                  <option value="AnterAja">AnterAja</option>
                  <option value="POS Indonesia">POS Indonesia</option>
                  <option value="TIKI">TIKI</option>
                </select>
                <input
                  type="text"
                  value={resiInput}
                  onChange={(e) => setResiInput(e.target.value)}
                  placeholder="Masukkan nomor resi"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:ring-1 focus:ring-[#163f73]/20 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveResi}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-[#163f73] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f2d55] transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" /> {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => { setEditingResi(false); setResiInput(order.nomor_resi || ""); setCourierInput(order.jenis_pengiriman || ""); }}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-3.5 w-3.5" /> Batal
                  </button>
                </div>
              </div>
            ) : order.nomor_resi ? (
              <div className="mt-2">
                {order.jenis_pengiriman && (
                  <p className="text-sm font-bold text-[#163f73]">{order.jenis_pengiriman}</p>
                )}
                <p className="text-sm font-mono text-gray-800">{order.nomor_resi}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm italic text-gray-400">Belum ada nomor resi</p>
            )}
          </div>

          {/* Penerima */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Penerima</p>
                <p className="text-sm font-semibold text-gray-800">{order.nama_penerima}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Telepon</p>
                <p className="text-sm text-gray-800">{order.no_telepon || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Alamat</p>
                <p className="text-sm text-gray-800">{order.alamat_pengiriman}</p>
              </div>
            </div>
            {order.catatan && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Catatan</p>
                  <p className="text-sm text-gray-800">{order.catatan}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#163f73]">
            <Package className="h-5 w-5" /> Detail Produk
          </h2>

          <div className="mt-4 space-y-3">
            {order.details.map((item) => (
              <Link key={item.id_detail} href={`/toko/${item.id_product}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
                  {item.product.gambar_url ? (
                    <Image src={item.product.gambar_url} alt={item.product.nama_produk} fill sizes="64px" className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">🛍️</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a1a1a] line-clamp-1">{item.product.nama_produk}</p>
                  <p className="text-xs text-gray-500">{item.kuantitas} pcs × {formatRupiah(item.harga_satuan_terekam)}</p>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-[#163f73]">{formatRupiah(item.subtotal)}</p>
              </Link>
            ))}
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="flex justify-between text-base">
            <span className="font-bold text-[#1a1a1a]">Total Pembayaran</span>
            <span className="text-lg font-extrabold text-[#163f73]">{formatRupiah(order.total_pembayaran)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
