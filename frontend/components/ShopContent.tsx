"use client";

import { useState } from "react";
import CategoryFilter from "./CategoryFilter";
import ProductCardShop from "./ProductCardShop";
import { type Product } from "@/lib/api";

interface ShopContentProps {
  products: Product[];
  categories: string[];
}

export default function ShopContent({ products, categories }: ShopContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = products.filter((p) => {
    if (p.nama_produk.trim() === "") return false;
    const matchCategory = !selectedCategory || p.kategori === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari produk..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#163f73] focus:outline-none focus:ring-1 focus:ring-[#163f73]/30 sm:text-base"
        />
      </div>

      {/* Category filter */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Jumlah */}
      <p className="mt-4 mb-5 text-xs text-gray-400 sm:text-sm">
        Menampilkan {filtered.length} produk
        {selectedCategory && ` di "${selectedCategory}"`}
        {searchQuery && ` untuk "${searchQuery}"`}
      </p>

      {/* Grid produk */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {filtered.map((product) => (
            <ProductCardShop key={product.id_product} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-400">Produk tidak ditemukan</p>
          <button
            onClick={() => {
              setSelectedCategory("");
              setSearchQuery("");
            }}
            className="mt-3 text-sm font-semibold text-[#163f73] hover:underline"
          >
            Reset filter
          </button>
        </div>
      )}
    </>
  );
}
