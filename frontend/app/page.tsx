import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BestSellingSection from "@/components/BestSellingSection";
import ProductGridSection from "@/components/ProductGridSection";
import Footer from "@/components/Footer";
import { fetchProducts, fetchBestSelling, type Product } from "@/lib/api";

export default async function Home() {
  let bestSelling: Product[] = [];
  let allProducts: Product[] = [];

  try {
    [bestSelling, allProducts] = await Promise.all([
      fetchBestSelling(),
      fetchProducts(),
    ]);
  } catch {
    // Backend belum menyala — tampilkan halaman kosong dengan graceful fallback
  }

  const activeProducts = allProducts.filter((p) => p.nama_produk.trim() !== "");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BestSellingSection products={bestSelling} />
        <ProductGridSection products={activeProducts} />
      </main>
      <Footer />
    </>
  );
}
