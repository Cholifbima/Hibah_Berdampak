import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import BestSellingSection from "@/components/BestSellingSection";
import NewProductsSection from "@/components/NewProductsSection";
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
  
  // Produk Terbaru: Sort by created_at desc
  const newProducts = [...allProducts]
    .filter((p) => !bestSellingIds.has(p.id_product) && p.stok > 0)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const newProductIds = new Set(newProducts.map((p) => p.id_product));

  // Etalase: Exclude best selling and new products, sort A-Z
  const etalaseProducts = allProducts
    .filter((p) => !bestSellingIds.has(p.id_product) && !newProductIds.has(p.id_product) && p.stok > 0)
    .sort((a, b) => a.nama_produk.localeCompare(b.nama_produk))
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "TopKonveksi",
    "image": "https://topkonveksi.com/assets/icons/IkonHibah/logo_bg_white_large.jpeg",
    "@id": "https://topkonveksi.com",
    "url": "https://topkonveksi.com",
    "telephone": "+628157799036",
    "priceRange": "Rp",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Semarang",
      "addressLocality": "Semarang",
      "addressRegion": "Jawa Tengah",
      "addressCountry": "ID"
    },
    "description": "Pabrik konveksi tas, baju, dan produk custom berkualitas dengan harga terjangkau di Semarang."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar transparentOnTop={true} />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <BestSellingSection products={bestSelling} />
        <NewProductsSection products={newProducts} />
        <EtalaseSection products={etalaseProducts} />
        <AIConsultantSection />
      </main>
      <Footer />
    </>
  );
}
