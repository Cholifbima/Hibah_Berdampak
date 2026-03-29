"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { type Product } from "@/lib/api";

interface ProductGridSectionProps {
  products: Product[];
}

const INITIAL_COUNT = 8;
const LOAD_MORE_COUNT = 8;

export default function ProductGridSection({ products }: ProductGridSectionProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section id="produk-kami" className="bg-gray-50 py-16 sm:py-20 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Produk Kami
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-gray-500">
          Semua produk buatan pengrajin Top Production — dari tas custom sampai perlengkapan olahraga
        </p>

        <div className="mt-10 grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
              className="inline-flex items-center rounded-full border-2 border-blue-600 px-8 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
            >
              LIHAT SEMUA
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
