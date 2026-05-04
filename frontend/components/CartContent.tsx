"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, getEffectivePrice } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/api";

export default function CartContent() {
  const { items, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/60 shadow-inner">
          <ShoppingBag className="h-10 w-10 text-[#163f73]/40" />
        </div>
        <h2 className="text-xl font-bold text-[#163f73]">Keranjang Kosong</h2>
        <p className="mt-2 text-sm text-gray-500">
          Belum ada produk di keranjang. Yuk mulai belanja!
        </p>
        <Link
          href="/toko"
          className="mt-6 inline-flex items-center rounded-full bg-[#163f73] px-8 py-3 text-sm font-bold text-white shadow hover:bg-[#0f2d55] transition-colors"
        >
          Lihat Produk
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.harga_satuan * item.qty, 0);
  const totalAfterDiscount = items.reduce(
    (sum, item) => sum + getEffectivePrice(item) * item.qty,
    0
  );
  const totalSaved = subtotal - totalAfterDiscount;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* ── Item list ── */}
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => {
          const unitPrice = getEffectivePrice(item);
          const isDiscounted = unitPrice < item.harga_satuan;
          const matchedDiscount = item.discounts
            .filter((d) => item.qty >= d.min_qty)
            .sort((a, b) => b.min_qty - a.min_qty)[0];
          const discountPct = isDiscounted
            ? Math.round((1 - unitPrice / item.harga_satuan) * 100)
            : 0;

          return (
            <div
              key={item.id_product}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex gap-4">
                {/* Gambar produk */}
                <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#c3dcff] to-[#7ab2f4]">
                  {item.gambar_url ? (
                    <Image
                      src={item.gambar_url}
                      alt={item.nama_produk}
                      fill
                      sizes="88px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                  )}
                </div>

                {/* Info produk */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <Link
                      href={`/toko/detail?id=${item.id_product}`}
                      className="block text-[13px] font-semibold leading-snug text-[#1a1a1a] line-clamp-2 hover:text-[#163f73] transition-colors"
                    >
                      {item.nama_produk}
                    </Link>

                    {/* Harga */}
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-extrabold text-[#163f73]">
                        {formatRupiah(unitPrice)}
                      </span>
                      {isDiscounted && (
                        <>
                          <span className="text-[11px] text-gray-400 line-through">
                            {formatRupiah(item.harga_satuan)}
                          </span>
                          <span className="rounded-[3px] bg-[#c3dcff] px-1.5 py-px text-[9px] font-extrabold text-[#163f73]">
                            -{discountPct}%
                          </span>
                        </>
                      )}
                    </div>

                    {matchedDiscount && (
                      <span className="mt-1 inline-block rounded-md bg-[#163f73]/10 px-2 py-0.5 text-[9px] font-bold text-[#163f73]">
                        GROSIR ≥{matchedDiscount.min_qty} pcs
                      </span>
                    )}
                  </div>

                  {/* Qty controls + hapus */}
                  <div className="mt-3 flex items-center justify-between">
                    {/* Kontrol qty */}
                    <div className="flex items-center gap-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id_product, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 touch-manipulation transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-[#1a1a1a]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id_product, item.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-100 touch-manipulation transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Subtotal + hapus */}
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-extrabold text-[#163f73]">
                        {formatRupiah(unitPrice * item.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id_product)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors touch-manipulation"
                        title="Hapus produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Ringkasan belanja ── */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          {/* Estimasi Total heading */}
          <h2 className="text-[20px] font-bold text-black">Estimasi Total</h2>

          {/* Baris subtotal */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>
                Subtotal ({items.reduce((s, i) => s + i.qty, 0)} produk)
              </span>
              <span className="font-semibold text-[#1a1a1a]">{formatRupiah(subtotal)}</span>
            </div>

            {/* Diskon */}
            {totalSaved > 0 && (
              <div className="flex justify-between">
                <span className="text-[#163f73] font-medium">Diskon</span>
                <span className="font-semibold text-[#163f73]">-{formatRupiah(totalSaved)}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Total besar */}
          <div className="flex justify-between items-baseline">
            <span className="text-[15px] font-bold text-[#1a1a1a]">Total</span>
            <span className="text-[18px] font-extrabold text-[#163f73]">
              {formatRupiah(totalAfterDiscount)}
            </span>
          </div>

          {/* Catatan pajak */}
          <p className="text-[11px] text-gray-400 leading-snug">
            Pajak dan pengiriman dihitung saat checkout.
          </p>

          {/* Tombol pesan */}
          <Link
            href="/pemesanan"
            className="block w-full rounded-full bg-[#163f73] py-3.5 text-center text-sm font-bold text-white shadow hover:bg-[#0f2d55] active:scale-[0.98] transition-all touch-manipulation"
          >
            Lanjut ke Pemesanan
          </Link>

          {/* Lanjut belanja */}
          <Link
            href="/toko"
            className="block w-full rounded-full border-2 border-[#163f73] py-3 text-center text-sm font-bold text-[#163f73] hover:bg-[#163f73]/5 transition-colors touch-manipulation"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
