"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { formatRupiah, apiUrl } from "@/lib/api";
import {
  ArrowLeft, Package, Clock, Truck, CheckCircle, MapPin, Phone,
  User, FileText, Loader2, Edit3, Save, X, MessageCircle, Upload, Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

let WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6282243293881";
if (WA_NUMBER.startsWith("0")) WA_NUMBER = "62" + WA_NUMBER.slice(1);
if (WA_NUMBER.startsWith("+")) WA_NUMBER = WA_NUMBER.slice(1);

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
  bukti_pembayaran_url: string | null;
  details: OrderDetail[];
}

const STATUS_STEPS = ["PENDING", "DIKONFIRMASI", "DIPROSES", "DIKIRIM", "SELESAI"];
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Menunggu Konfirmasi", color: "text-amber-600", icon: Clock },
  DIKONFIRMASI: { label: "Dikonfirmasi", color: "text-blue-600", icon: Package },
  DIPROSES: { label: "Diproses", color: "text-indigo-600", icon: Package },
  DIKIRIM: { label: "Dalam Pengiriman", color: "text-purple-600", icon: Truck },
  SELESAI: { label: "Selesai", color: "text-green-600", icon: CheckCircle },
  MENUNGGU_PEMBATALAN: { label: "Menunggu Pembatalan", color: "text-orange-500", icon: Clock },
  DIBATALKAN: { label: "Dibatalkan", color: "text-red-600", icon: Clock },
};

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  if (status === "DIBATALKAN" || status === "MENUNGGU_PEMBATALAN") {
    return (
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${status === 'DIBATALKAN' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
        <Clock className="h-4 w-4" /> {status === 'DIBATALKAN' ? 'Pesanan Dibatalkan' : 'Menunggu Persetujuan Admin untuk Dibatalkan'}
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
          <div key={step} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <div className={`absolute right-1/2 top-5 h-0.5 w-full z-0 ${done ? "bg-[#163f73]" : "bg-gray-200"}`} />
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

function OrderDetailInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    if (!token || !orderId) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/orders/${orderId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(res.status === 404 ? "Pesanan tidak ditemukan" : "Gagal memuat pesanan");
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    if (!authLoading) fetchOrder();
  }, [authLoading, fetchOrder]);

  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  async function handleTrack() {
    if (!token || !order) return;
    setTrackingLoading(true);
    setTrackingError("");
    try {
      const res = await fetch(apiUrl(`/orders/${order.id_order}/track`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melacak resi");
      setTrackingData(data.data);
    } catch (err: any) {
      setTrackingError(err.message);
    }
    setTrackingLoading(false);
  }

  const [canceling, setCanceling] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUploadBukti(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || !order) return;
    
    // Validasi ukuran max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("bukti", file);

      const res = await fetch(apiUrl(`/orders/${order.id_order}/upload-bukti`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // tanpa Content-Type agar browser otomatis set multipart boundary
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setOrder({ ...order, bukti_pembayaran_url: data.url, status_pesanan: 'MENUNGGU_KONFIRMASI' });
        alert("Bukti pembayaran berhasil diupload!");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengupload bukti pembayaran");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
    setUploading(false);
  }

  async function handleCancelRequest() {
    if (!token || !order) return;
    if (!confirm("Apakah Anda yakin ingin mengajukan pembatalan pesanan ini?")) return;
    setCanceling(true);
    try {
      const res = await fetch(apiUrl(`/orders/${order.id_order}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status_pesanan: "MENUNGGU_PEMBATALAN" }),
      });
      if (res.ok) {
        setOrder(await res.json());
      } else {
        alert("Gagal mengajukan pembatalan.");
      }
    } catch { 
      alert("Terjadi kesalahan.");
    }
    setCanceling(false);
  }

  const [completing, setCompleting] = useState(false);
  async function handleCompleteOrder() {
    if (!token || !order) return;
    if (!confirm("Apakah Anda yakin pesanan sudah diterima dengan baik?")) return;
    setCompleting(true);
    try {
      const res = await fetch(apiUrl(`/orders/${order.id_order}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status_pesanan: "SELESAI" }),
      });
      if (res.ok) {
        setOrder(await res.json());
      } else {
        alert("Gagal mengonfirmasi pesanan.");
      }
    } catch { 
      alert("Terjadi kesalahan.");
    }
    setCompleting(false);
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
        <button type="button" onClick={() => router.push("/pesanan")} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[#163f73] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Pesanan
        </button>

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

        {/* --- BANNER AKTIFKAN NOTIFIKASI WA --- */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-5 shadow-sm sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div className="flex-1">
            <h3 className="text-base font-bold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Aktifkan Notifikasi Otomatis
            </h3>
            <p className="mt-1 text-sm text-green-50">
              Dapatkan *update* resi dan status pesanan langsung di WhatsApp Anda. Klik tombol di samping dan kirim pesannya sekarang agar sistem kami bisa menghubungi Anda!
            </p>
          </div>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo TopAssist! Tolong aktifkan notifikasi otomatis untuk pesanan saya dengan kode: *${order.kode_pesanan}*. Terima kasih!`)}`}
            target="_blank"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-green-600 shadow-sm hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Aktifkan via WA
          </a>
        </div>
        {/* ------------------------------------- */}

        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#163f73]">
            <Truck className="h-5 w-5" /> Informasi Pengiriman
          </h2>

          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Nomor Resi</span>
            </div>

            {order.nomor_resi ? (
              <div className="mt-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div>
                    {order.jenis_pengiriman && (
                      <p className="text-xs font-bold uppercase text-[#163f73] mb-1">{order.jenis_pengiriman}</p>
                    )}
                    <p className="text-sm font-mono font-semibold text-gray-800">{order.nomor_resi}</p>
                  </div>
                  <button
                    onClick={handleTrack}
                    disabled={trackingLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-[#163f73] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f2d55] disabled:opacity-50 transition-colors"
                  >
                    {trackingLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                    Lacak
                  </button>
                </div>

                {trackingError && (
                  <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{trackingError}</p>
                )}

                {trackingData && trackingData.history && (
                  <div className="mt-4 rounded-lg bg-white p-4 border border-gray-200">
                    <div className="mb-4 pb-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase">Status Terkini</p>
                      <p className="text-sm font-bold text-[#163f73]">{trackingData.summary?.status || "Berjalan"}</p>
                    </div>
                    <div className="relative border-l-2 border-gray-100 ml-2 space-y-6">
                      {trackingData.history.map((h: any, idx: number) => (
                        <div key={idx} className="relative pl-5">
                          <div className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${idx === 0 ? 'bg-[#163f73] ring-4 ring-blue-50' : 'bg-gray-300'}`} />
                          <p className={`text-sm ${idx === 0 ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>{h.desc}</p>
                          <p className="text-xs text-gray-500 mt-1">{h.date} {h.location ? `• ${h.location}` : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm italic text-gray-400">Belum ada nomor resi</p>
            )}
          </div>

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

        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#163f73]">
            <Package className="h-5 w-5" /> Detail Produk
          </h2>

          <div className="mt-4 space-y-3">
            {order.details.map((item) => (
              <Link key={item.id_detail} href={`/toko/detail?id=${item.id_product}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
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

          {(order.status_pesanan === "PENDING" || order.status_pesanan === "MENUNGGU_KONFIRMASI") && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="font-bold text-[#163f73]">Status Pembayaran: {order.status_pesanan === "PENDING" ? "Menunggu Pembayaran" : "Menunggu Konfirmasi"}</h3>
              <p className="mt-1 text-sm text-blue-800">
                {order.status_pesanan === "PENDING" 
                  ? "Silakan hubungi Admin untuk meminta detail nomor rekening, lalu upload bukti pembayarannya agar pesanan Anda segera diproses."
                  : "Bukti pembayaran Anda sedang dicek oleh Admin."}
              </p>
              
              {order.bukti_pembayaran_url && (
                <div className="mt-4 border-t border-blue-100 pt-4">
                  <p className="text-xs font-semibold text-[#163f73] mb-2">Bukti yang diunggah:</p>
                  <div className="relative h-32 w-full sm:w-48 overflow-hidden rounded-lg border border-blue-200 bg-white">
                    <Image src={apiUrl(order.bukti_pembayaran_url)} alt="Bukti Pembayaran Anda" fill className="object-contain" unoptimized />
                  </div>
                  <a href={apiUrl(order.bukti_pembayaran_url)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-bold text-[#0066ff] hover:underline">
                    Buka Gambar Penuh ↗
                  </a>
                </div>
              )}

              {order.status_pesanan === "PENDING" && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo Admin, saya ingin meminta nomor rekening untuk pembayaran pesanan ${order.kode_pesanan}.`)}`}
                    target="_blank"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#163f73] shadow-sm hover:bg-gray-50 border border-blue-200 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> Minta Nomor Rekening
                  </a>
                  
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#163f73] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0f2d55] transition-colors relative overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleUploadBukti} disabled={uploading} className="hidden" />
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Upload Bukti Pembayaran</>
                    )}
                  </label>
                </div>
              )}
            </div>
          )}

          {(order.status_pesanan === "PENDING" || order.status_pesanan === "MENUNGGU_KONFIRMASI" || order.status_pesanan === "DIKONFIRMASI" || order.status_pesanan === "DIPROSES") && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={canceling}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                {canceling ? "Mengajukan..." : "Ajukan Pembatalan"}
              </button>
            </div>
          )}

          {order.status_pesanan === "DIKIRIM" && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
              <Link
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo Admin, saya ingin mengajukan keluhan untuk pesanan ${order.kode_pesanan}.`)}`}
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors"
              >
                Ajukan Keluhan
              </Link>
              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={completing}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {completing ? "Memproses..." : "Pesanan Diterima"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="h-20 bg-gradient-to-r from-[#1f67df] to-[#163a78]"><Navbar /></div>
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-[#163f73]" />
          </div>
        </div>
      }
    >
      <OrderDetailInner />
    </Suspense>
  );
}
