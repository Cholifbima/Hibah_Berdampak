import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BestSellingSection from "@/components/BestSellingSection";
import AIConsultantSection from "@/components/AIConsultantSection";
import Footer from "@/components/Footer";
import { fetchBestSelling, type Product } from "@/lib/api";

export default async function Home() {
  let bestSelling: Product[] = [];

  try {
    bestSelling = await fetchBestSelling();
  } catch {
    // Backend belum menyala — tampilkan halaman tanpa data
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BestSellingSection products={bestSelling} />
        <AIConsultantSection />
      </main>
      <Footer />
    </>
  );
}
