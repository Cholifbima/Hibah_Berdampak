"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart, getEffectivePrice } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Send, ShoppingBag, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const WA_NUMBER = "62895386224772";
const ORDER_COUNTER_KEY = "topassist_order_counter";

function getNextOrderNumber(): string {
  const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "0", 10);
  const next = current + 1;
  localStorage.setItem(ORDER_COUNTER_KEY, String(next));
  return `#${String(next).padStart(4, "0")}`;
}

export default function OrderForm() {
  const { items, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const previewOrderNumber = useMemo(() => {
    if (typeof window === "undefined") return "#0001";
    const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "0", 10);
    return `#${String(current + 1).padStart(4, "0")}`;
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-20 w-20 text-[#163f73]/20" />
        <h2 className="mt-4 text-xl font-bold text-[#163f73]">Keranjang Kosong</h2>
        <p className="mt-2 text-sm text-gray-500">
          Tambah produk ke keranjang terlebih dahulu sebelum membuat pesanan.
        </p>
        <Link
          href="/toko"
          className="mt-6 inline-flex items-center rounded-2xl bg-[#163f73] px-8 py-3 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors"
        >
          Lihat Produk
        </Link>
      </div>
    );
  }

  const totalAfterDiscount = items.reduce(
    (sum, item) => sum + getEffectivePrice(item) * item.qty,
    0
  );

  function buildMessage(orderNum: string): string {
    const lines: string[] = [];
    lines.push(`🛒 *PESANAN BARU — TopAssist*`);
    lines.push(`📋 *No. Order: ${orderNum}*`);
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");
    lines.push(`👤 *Nama:* ${nama}`);
    lines.push(`📱 *Telepon:* ${telepon}`);
    lines.push(`📍 *Alamat:* ${alamat}`);
    if (catatan.trim()) lines.push(`📝 *Catatan:* ${catatan}`);
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("📦 *Detail Pesanan:*");
    lines.push("");

    items.forEach((item, idx) => {
      const unitPrice = getEffectivePrice(item);
      const isDiscounted = unitPrice < item.harga_satuan;
      lines.push(`${idx + 1}. *${item.nama_produk}*`);
      lines.push(`   ${item.qty} pcs × ${formatRupiah(unitPrice)}`);
      if (isDiscounted) {
        const matched = item.discounts
          .filter((d) => item.qty >= d.min_qty)
          .sort((a, b) => b.min_qty - a.min_qty)[0];
        lines.push(`   💰 Harga grosir (min ${matched.min_qty} pcs)`);
      }
      lines.push(`   Subtotal: ${formatRupiah(unitPrice * item.qty)}`);
      lines.push("");
    });

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push(`💵 *TOTAL: ${formatRupiah(totalAfterDiscount)}*`);
    lines.push("");
    lines.push("Mohon konfirmasi pesanan ini. Terima kasih! 🙏");

    return lines.join("\n");
  }

  const isValid = nama.trim() && telepon.trim() && alamat.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const orderNum = getNextOrderNumber();

    if (user && token) {
      try {
        await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            kode_pesanan: orderNum,
            nama_penerima: nama,
            alamat_pengiriman: alamat,
            no_telepon: telepon,
            catatan,
            items: items.map((item) => ({
              id_product: item.id_product,
              kuantitas: item.qty,
              harga_satuan_terekam: getEffectivePrice(item),
              subtotal: getEffectivePrice(item) * item.qty,
            })),
          }),
        });
      } catch { /* WA tetap dikirim meski DB gagal */ }
    }

    const msg = encodeURIComponent(buildMessage(orderNum));
    const url = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    window.open(url, "_blank");
    clearCart();
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
      {/* Form kiri */}
      <div className="space-y-5 lg:col-span-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-[#163f73]">Informasi Pemesan</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#163f73] focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#163f73] focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. ..., Kecamatan, Kota, Provinsi, Kode Pos"
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#163f73] focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Catatan (opsional)
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Warna, ukuran, permintaan khusus..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#163f73] focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Preview pesan */}
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="text-lg font-bold text-[#163f73]">Preview Pesan WhatsApp</h2>
            {showPreview ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showPreview && (
            <div className="mt-4 rounded-xl bg-[#e5f7e2] p-4 sm:p-5">
              <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700 sm:text-sm">
                {isValid ? buildMessage(previewOrderNumber) : "Lengkapi data di atas untuk melihat preview pesan."}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan kanan */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#163f73]">Pesanan Anda</h2>

          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => {
              const unitPrice = getEffectivePrice(item);
              return (
                <div key={item.id_product} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
                    {item.gambar_url ? (
                      <Image
                        src={item.gambar_url}
                        alt={item.nama_produk}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg">🛍️</div>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-[#1a1a1a] line-clamp-1">{item.nama_produk}</p>
                    <p className="text-xs text-gray-500">
                      {item.qty} pcs × {formatRupiah(unitPrice)}
                    </p>
                    <p className="font-extrabold text-[#163f73]">{formatRupiah(unitPrice * item.qty)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="border-gray-100" />

          <div className="flex justify-between text-base">
            <span className="font-bold text-[#1a1a1a]">Total</span>
            <span className="text-lg font-extrabold text-[#163f73]">
              {formatRupiah(totalAfterDiscount)}
            </span>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
          >
            <Send className="h-4 w-4" />
            Kirim Pesanan via WhatsApp
          </button>

          <Link
            href="/keranjang"
            className="block w-full rounded-2xl border-2 border-[#163f73] py-3 text-center text-sm font-bold text-[#163f73] hover:bg-[#163f73]/5 transition-colors"
          >
            Kembali ke Keranjang
          </Link>
        </div>
      </div>
    </form>
  );
}
