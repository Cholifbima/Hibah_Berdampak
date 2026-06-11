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
  harga_asli: number | null;
  diskon_persen: number | null;
  harga_grosir: number | null;
  min_grosir: number | null;
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

/**
 * authFetch: wrapper around fetch() yang otomatis handle token expired.
 * 
 * Flow jika 401:
 * 1. Coba refresh token via /auth/refresh
 * 2. Jika berhasil, retry request asli dengan token baru
 * 3. Jika gagal, clear session & redirect ke login
 * 
 * Gunakan ini untuk semua fetch yang butuh auth (bukan fetch login/register).
 */
export async function authFetch(
  url: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<Response> {
  const res = await fetch(url, options);

  // Jika bukan 401, langsung return
  if (res.status !== 401) return res;

  // Coba refresh token
  const TOKEN_KEY = "topassist_token";
  const USER_KEY = "topassist_user";
  const currentToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  if (!currentToken) {
    // Tidak ada token sama sekali, langsung redirect
    forceLogout();
    return res;
  }

  try {
    const refreshRes = await fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    if (!refreshRes.ok) {
      // Refresh gagal, force logout
      forceLogout();
      return res;
    }

    const refreshData = await refreshRes.json();
    if (!refreshData.token) {
      forceLogout();
      return res;
    }

    // Simpan token baru
    localStorage.setItem(TOKEN_KEY, refreshData.token);
    if (refreshData.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(refreshData.user));
    }

    // Retry request asli dengan token baru
    const newHeaders = { ...options.headers };
    if (newHeaders["Authorization"] || newHeaders["authorization"]) {
      newHeaders["Authorization"] = `Bearer ${refreshData.token}`;
    }

    const retryRes = await fetch(url, { ...options, headers: newHeaders });
    
    // Dispatch event supaya auth context sync dengan token baru
    window.dispatchEvent(new CustomEvent("auth-token-refreshed", {
      detail: { token: refreshData.token, user: refreshData.user },
    }));

    return retryRes;
  } catch {
    // Network error saat refresh, return original response
    return res;
  }
}

function forceLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("topassist_token");
  localStorage.removeItem("topassist_user");
  
  // Dispatch event supaya auth context logout
  window.dispatchEvent(new Event("auth-force-logout"));
  
  // Redirect ke login jika di halaman admin
  if (window.location.pathname.startsWith("/admin")) {
    window.location.href = "/login";
  }
}
