"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBox from "@/components/ChatBox";
import { fetchProducts, type Product } from "@/lib/api";

export default function KonsultanPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((p) => {
        if (!cancelled) setProducts(p);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeProducts = products.filter((p) => p.nama_produk.trim() !== "");

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f0f4f8]" style={{ paddingTop: "64px", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <div className="flex flex-1 flex-col mx-auto w-full max-w-3xl px-0 sm:px-4 sm:py-4" style={{ height: "calc(100dvh - 64px)" }}>
          <div className="flex flex-1 flex-col overflow-hidden sm:rounded-2xl sm:shadow-lg">
            <ChatBox products={activeProducts} />
          </div>
        </div>
      </main>
    </>
  );
}
