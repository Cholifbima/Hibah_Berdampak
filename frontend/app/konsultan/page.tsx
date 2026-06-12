"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatBox from "@/components/ChatBox";
import { fetchProducts, type Product } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function KonsultanPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteksi rute: jika belum login, arahkan ke /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/konsultan");
    }
  }, [user, loading, router]);

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

  // Tampilkan loading screen saat mengecek sesi auth
  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#e9f4ff] pt-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#163f73]" />
            <p className="text-sm font-semibold text-[#163f73]">Memeriksa sesi...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main
        className="flex flex-1 flex-col"
        style={{
          paddingTop: "64px",
          minHeight: "100dvh",
          background: "linear-gradient(160deg, #e9f4ff 0%, #dbeeff 40%, #c8e1ff 100%)",
        }}
      >
        <div
          className="flex flex-1 flex-col mx-auto w-full max-w-2xl px-3 py-3 sm:px-6 sm:py-5"
          style={{ height: "calc(100dvh - 64px)" }}
        >
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl shadow-xl shadow-[#163f73]/10 ring-1 ring-white/80">
            <ChatBox products={activeProducts} />
          </div>
        </div>
      </main>
    </>
  );
}
