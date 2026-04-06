import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBox from "@/components/ChatBox";
import { fetchProducts, type Product } from "@/lib/api";

export const metadata = {
  title: "Konsultan AI — TopAssist",
  description: "Tanyakan apapun tentang produk TopAssist kepada Konsultan AI kami.",
};

export default async function KonsultanPage() {
  let products: Product[] = [];

  try {
    products = await fetchProducts();
  } catch {
    // fallback empty
  }

  const activeProducts = products.filter((p) => p.nama_produk.trim() !== "");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section
          className="pt-20 pb-6 sm:pt-24 sm:pb-8"
          style={{
            background:
              "linear-gradient(180deg, rgb(31, 103, 223) 0%, rgb(28, 84, 179) 50%, rgb(24, 65, 136) 100%)",
          }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h1 className="text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
              Konsultan AI
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Tanya rekomendasi produk, cek ketersediaan, atau apapun seputar TopAssist
            </p>
          </div>
        </section>

        <section className="bg-[#e9f4ff] py-6 sm:py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <ChatBox products={activeProducts} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
