"use client";

import Link from "next/link";
import { Package } from "lucide-react";

export default function AdminProdukPlaceholder() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] px-4 py-24 text-center">
      <Package className="mx-auto h-12 w-12 text-[#163f73]/40" />
      <h1 className="mt-4 text-lg font-bold text-[#163f73]">Kelola Produk</h1>
      <p className="mt-2 text-sm text-gray-500">Halaman ini siap dikembangkan (CRUD produk).</p>
      <Link href="/admin" className="mt-6 inline-block text-sm font-semibold text-[#163f73] underline">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
