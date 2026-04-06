"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { type BulkDiscount, getApiBase } from "./api";
import { useAuth } from "./auth-context";


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
  /** true = belum selesai ambil keranjang dari server (user login) */
  cartLoading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const GUEST_KEY = "topassist_cart_guest";
const LEGACY_KEY = "topassist_cart";

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(GUEST_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        localStorage.setItem(GUEST_KEY, raw);
        localStorage.removeItem(LEGACY_KEY);
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    /* quota */
  }
}

function clearGuestStorage() {
  try {
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* */
  }
}

function mergeCarts(server: CartItem[], guest: CartItem[]): CartItem[] {
  const map = new Map<number, CartItem>();
  for (const s of server) map.set(s.id_product, { ...s });
  for (const g of guest) {
    const ex = map.get(g.id_product);
    if (ex) ex.qty += g.qty;
    else map.set(g.id_product, { ...g });
  }
  return Array.from(map.values());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const prevUserRef = useRef<typeof user>(null);
  const syncDoneRef = useRef(false);
  const skipPersistRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  /** Guest vs logout vs login: isi keranjang dari localStorage atau server */
  useEffect(() => {
    if (!hydrated) return;

    if (!user || !token) {
      const hadUser = prevUserRef.current !== null;
      prevUserRef.current = null;
      syncedUserIdRef.current = null;
      syncDoneRef.current = true;

      if (hadUser) {
        clearGuestStorage();
        setItems([]);
      } else {
        setItems(loadGuestCart());
      }
      setCartLoading(false);
      return;
    }

    prevUserRef.current = user;

    if (syncedUserIdRef.current === user.id_user) {
      syncDoneRef.current = true;
      return;
    }

    let cancelled = false;
    const ac = new AbortController();

    (async () => {
      setCartLoading(true);
      syncDoneRef.current = false;

      try {
        const guest = loadGuestCart();

        let server: CartItem[] = [];
        let getOk = false;
        for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 400 * attempt));
          }
          try {
            const res = await fetch(`${getApiBase()}/api/cart`, {
              headers: { Authorization: `Bearer ${token}` },
              signal: ac.signal,
            });
            if (res.status === 401) {
              syncDoneRef.current = true;
              setCartLoading(false);
              return;
            }
            if (res.ok) {
              server = await res.json();
              getOk = true;
              break;
            }
          } catch {
            /* retry */
          }
        }

        if (cancelled) return;

        const merged = mergeCarts(server, guest);

        if (guest.length > 0) {
          const put = await fetch(`${getApiBase()}/api/cart`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: merged.map((i) => ({ id_product: i.id_product, qty: i.qty })),
            }),
            signal: ac.signal,
          });
          if (!put.ok || cancelled) {
            skipPersistRef.current = true;
            setItems(merged);
            syncedUserIdRef.current = user.id_user;
          } else {
            clearGuestStorage();
            const saved: CartItem[] = await put.json();
            if (!cancelled) {
              skipPersistRef.current = true;
              setItems(saved);
              syncedUserIdRef.current = user.id_user;
            }
          }
        } else if (getOk && !cancelled) {
          skipPersistRef.current = true;
          setItems(server);
          syncedUserIdRef.current = user.id_user;
        } else if (!cancelled) {
          skipPersistRef.current = true;
          setItems(merged);
          syncedUserIdRef.current = user.id_user;
        }
      } catch {
        if (!cancelled) {
          const g = loadGuestCart();
          skipPersistRef.current = true;
          setItems(g.length ? mergeCarts([], g) : []);
          syncedUserIdRef.current = user.id_user;
        }
      } finally {
        if (!cancelled) {
          syncDoneRef.current = true;
          setCartLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [hydrated, user, token]);

  /** Guest: simpan ke localStorage */
  useEffect(() => {
    if (!hydrated || user) return;
    saveGuestCart(items);
  }, [items, hydrated, user]);

  /** User login: sync ke API */
  useEffect(() => {
    if (!hydrated || !user || !token) return;
    if (!syncDoneRef.current) return;
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      fetch(`${getApiBase()}/api/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({ id_product: i.id_product, qty: i.qty })),
        }),
      }).catch(() => {});
    }, 450);

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [items, hydrated, user, token]);

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
    setItems((prev) => prev.map((i) => (i.id_product === id ? { ...i, qty } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    clearGuestStorage();
    if (user && token) {
      fetch(`${getApiBase()}/api/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: [] }),
      }).catch(() => {});
    }
  }, [user, token]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        cartLoading,
      }}
    >
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
