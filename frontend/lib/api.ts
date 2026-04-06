/**
 * URL dasar API Express.
 * - Jika NEXT_PUBLIC_API_URL di-set: dipakai apa adanya (mis. tunnel backend terpisah).
 * - Jika tidak di-set: di browser pakai path relatif "" → fetch("/api/...") lewat proxy Next (next.config rewrites) — cocok saat akses lewat tunnel frontend saja.
 * - Di server (SSR): langsung ke Express di mesin yang sama.
 */
export function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return "";
  return "http://127.0.0.1:5000";
}

export interface BulkDiscount {
  id_discount: number;
  id_product: number;
  min_qty: number;
  harga_grosir: number;
}

export interface Product {
  id_product: number;
  nama_produk: string;
  deskripsi: string;
  harga_satuan: number;
  stok: number;
  kategori: string;
  gambar_url: string | null;
  created_at: string;
  updated_at: string;
  discounts: BulkDiscount[];
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${getApiBase()}/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal mengambil data produk");
  return res.json();
}

export async function fetchBestSelling(): Promise<Product[]> {
  const res = await fetch(`${getApiBase()}/api/products/best-selling`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal mengambil data best selling");
  return res.json();
}

export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Produk tidak ditemukan");
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${getApiBase()}/api/products/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal mengambil kategori");
  return res.json();
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
