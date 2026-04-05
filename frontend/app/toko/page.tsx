import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopContent from "@/components/ShopContent";
import { fetchProducts, fetchCategories, type Product } from "@/lib/api";

export const metadata = {
  title: "Produk Kami — TopAssist Bag Store",
  description: "Jelajahi semua produk berkualitas dari Top Production. Tas custom, perlengkapan olahraga, dan banyak lagi.",
};

export default async function TokoPage() {
  let products: Product[] = [];
  let categories: string[] = [];

  try {
    [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);
  } catch {
    // Backend belum menyala
  }

  const activeProducts = products.filter((p) => p.nama_produk.trim() !== "");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Header biru */}
        <section
          className="relative pt-20 pb-6 sm:pt-24 sm:pb-8"
          style={{
            background:
              "linear-gradient(180deg, rgb(31, 103, 223) 0%, rgb(28, 84, 179) 50%, rgb(24, 65, 136) 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h1 className="text-center text-2xl font-bold text-white drop-shadow-md sm:text-3xl lg:text-4xl">
              Produk Kami
            </h1>
            <p className="mx-auto mt-2 max-w-md text-center text-xs text-blue-100 sm:text-sm">
              Semua produk buatan pengrajin Top Production — kualitas terjamin, harga bersahabat
            </p>
          </div>
        </section>

        {/* Konten produk */}
        <section className="bg-[#e9f4ff] py-6 sm:py-8 lg:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ShopContent products={activeProducts} categories={categories} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
