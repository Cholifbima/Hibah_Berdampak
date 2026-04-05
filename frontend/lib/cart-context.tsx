"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { BulkDiscount } from "./api";

export interface CartItem {
  id_product: number;
  nama_produk: string;
  harga_satuan: number;
  gambar_url: string | null;
  qty: number;
  discounts: BulkDiscount[];
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "topassist_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* quota exceeded — ignore */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id_product === item.id_product);
      if (existing) {
        return prev.map((i) =>
          i.id_product === item.id_product ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id_product !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id_product === id ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function getEffectivePrice(item: CartItem): number {
  if (!item.discounts.length) return item.harga_satuan;
  const sorted = [...item.discounts].sort((a, b) => b.min_qty - a.min_qty);
  const matched = sorted.find((d) => item.qty >= d.min_qty);
  return matched ? matched.harga_grosir : item.harga_satuan;
}
