"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/api";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const disabled = product.stok === 0;

  function handleAdd() {
    if (disabled) return;
    addItem(
      {
        id_product: product.id_product,
        nama_produk: product.nama_produk,
        harga_satuan: product.harga_satuan,
        gambar_url: product.gambar_url,
        discounts: product.discounts,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-5 space-y-3">
      {/* Qty picker */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Jumlah:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={product.stok}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 1) setQty(Math.min(v, product.stok));
            }}
            className="h-9 w-14 rounded-xl border border-gray-200 text-center text-sm font-bold text-[#1a1a1a] focus:border-[#163f73] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stok, q + 1))}
            disabled={qty >= product.stok}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tombol */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors sm:text-base ${
          added
            ? "bg-green-600 text-white"
            : "bg-[#163f73] text-white hover:bg-[#0f2d55]"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {disabled ? (
          "Stok Habis"
        ) : added ? (
          <>
            <Check className="h-5 w-5" />
            Ditambahkan!
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            Tambah ke Keranjang
          </>
        )}
      </button>
    </div>
  );
}
