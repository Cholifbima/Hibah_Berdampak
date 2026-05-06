"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopContent from "@/components/ShopContent";
import { fetchProducts, fetchCategories, type Product } from "@/lib/api";

export default function TokoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([p, c]) => {
        if (!cancelled) {
          setProducts(p);
          setCategories(c);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setCategories([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeProducts = products.filter((p) => p.nama_produk.trim() !== "");

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#e9f4ff]">
        <section className="pt-[72px] sm:pt-[80px]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
            <ShopContent products={activeProducts} categories={categories} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
