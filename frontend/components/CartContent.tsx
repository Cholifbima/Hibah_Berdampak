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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-20 w-20 text-[#163f73]/20" />
        <h2 className="mt-4 text-xl font-bold text-[#163f73]">Keranjang Kosong</h2>
        <p className="mt-2 text-sm text-gray-500">
          Belum ada produk di keranjang. Yuk mulai belanja!
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

  const subtotal = items.reduce((sum, item) => sum + item.harga_satuan * item.qty, 0);
  const totalAfterDiscount = items.reduce(
    (sum, item) => sum + getEffectivePrice(item) * item.qty,
    0
  );
  const totalSaved = subtotal - totalAfterDiscount;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Item list */}
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => {
          const unitPrice = getEffectivePrice(item);
          const isDiscounted = unitPrice < item.harga_satuan;
          const matchedDiscount = item.discounts
            .filter((d) => item.qty >= d.min_qty)
            .sort((a, b) => b.min_qty - a.min_qty)[0];

          return (
            <div
              key={item.id_product}
              className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
            >
              {/* Gambar */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8] sm:h-28 sm:w-28">
                {item.gambar_url ? (
                  <Image
                    src={item.gambar_url}
                    alt={item.nama_produk}
                    fill
                    sizes="112px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/toko/${item.id_product}`}
                    className="text-sm font-semibold text-[#1a1a1a] line-clamp-2 hover:text-[#163f73] transition-colors sm:text-base"
                  >
                    {item.nama_produk}
                  </Link>

                  <div className="mt-1 flex items-center gap-2">
                    {isDiscounted && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatRupiah(item.harga_satuan)}
                      </span>
                    )}
                    <span className="text-sm font-extrabold text-[#163f73]">
                      {formatRupiah(unitPrice)}
                    </span>
                  </div>

                  {matchedDiscount && (
                    <span className="mt-1 inline-block rounded-lg bg-[#163f73] px-2 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">
                      GROSIR ≥{matchedDiscount.min_qty} pcs
                    </span>
                  )}
                </div>

                {/* Qty + hapus */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id_product, item.qty - 1)}
                      disabled={item.qty <= 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 sm:h-8 sm:w-8"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[#1a1a1a] sm:w-10">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id_product, item.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 sm:h-8 sm:w-8"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-[#163f73] sm:text-base">
                      {formatRupiah(unitPrice * item.qty)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id_product)}
                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ringkasan */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#163f73]">Ringkasan Belanja</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">
                Subtotal ({items.reduce((s, i) => s + i.qty, 0)} produk)
              </span>
              <span className="font-semibold text-[#1a1a1a]">{formatRupiah(subtotal)}</span>
            </div>

            {totalSaved > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Hemat Grosir</span>
                <span className="font-semibold">-{formatRupiah(totalSaved)}</span>
              </div>
            )}

            <hr className="my-2 border-gray-100" />

            <div className="flex justify-between text-base">
              <span className="font-bold text-[#1a1a1a]">Total</span>
              <span className="text-lg font-extrabold text-[#163f73]">
                {formatRupiah(totalAfterDiscount)}
              </span>
            </div>
          </div>

          <Link
            href="/pemesanan"
            className="block w-full rounded-2xl bg-[#163f73] py-3.5 text-center text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors sm:text-base"
          >
            Lanjut ke Pemesanan
          </Link>

          <Link
            href="/toko"
            className="block w-full rounded-2xl border-2 border-[#163f73] py-3 text-center text-sm font-bold text-[#163f73] hover:bg-[#163f73]/5 transition-colors"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
