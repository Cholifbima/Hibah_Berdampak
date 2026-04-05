const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  const res = await fetch(`${API_BASE}/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal mengambil data produk");
  return res.json();
}

export async function fetchBestSelling(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products/best-selling`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal mengambil data best selling");
  return res.json();
}

export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Produk tidak ditemukan");
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/products/categories`, {
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
