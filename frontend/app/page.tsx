import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import BestSellingSection from "@/components/BestSellingSection";
import EtalaseSection from "@/components/EtalaseSection";
import AIConsultantSection from "@/components/AIConsultantSection";
import Footer from "@/components/Footer";
import { fetchBestSelling, fetchProducts, type Product } from "@/lib/api";

export default async function Home() {
  let bestSelling: Product[] = [];
  let allProducts: Product[] = [];
  try {
    [bestSelling, allProducts] = await Promise.all([
      fetchBestSelling(),
      fetchProducts(),
    ]);
  } catch {
    bestSelling = [];
    allProducts = [];
  }

  const bestSellingIds = new Set(bestSelling.map((p) => p.id_product));
  const etalaseProducts = allProducts
    .filter((p) => !bestSellingIds.has(p.id_product) && p.stok > 0)
    .slice(0, 8);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <BestSellingSection products={bestSelling} />
        <EtalaseSection products={etalaseProducts} />
        <AIConsultantSection />
      </main>
      <Footer />
    </>
  );
}
