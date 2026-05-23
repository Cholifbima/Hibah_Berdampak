/**
 * Base URL API (tanpa trailing slash), harus menyertakan path `/api` jika backend di-mount di sana.
 * Production (static export): set NEXT_PUBLIC_API_URL=https://topkonveksi.com/api
 * Development: set NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api agar fetch langsung ke Express (CORS).
 */
export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") || "";
}

/**
 * Path relatif terhadap prefix API, mis: `/products`, `/cart`, `/auth/login`
 * (bukan `/api/products` — prefix `/api` sudah di NEXT_PUBLIC_API_URL).
 */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBase();
  if (base) return `${base}${p}`;
  if (typeof window !== "undefined") return `/api${p}`;
  const origin = (process.env.BACKEND_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
  return `${origin}/api${p}`;
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
  rating: number;
  link_shopee: string | null;
  link_tokopedia: string | null;
  link_lazada: string | null;
  created_at: string;
  updated_at: string;
  discounts: BulkDiscount[];
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(apiUrl("/products"), { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil data produk");
  return res.json();
}

export async function fetchBestSelling(): Promise<Product[]> {
  const res = await fetch(apiUrl("/products/best-selling"), { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil data best selling");
  return res.json();
}

export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(apiUrl(`/products/${id}`), { cache: "no-store" });
  if (!res.ok) throw new Error("Produk tidak ditemukan");
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(apiUrl("/products/categories"), { cache: "no-store" });
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
