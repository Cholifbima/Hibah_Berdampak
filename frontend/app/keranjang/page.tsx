import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartContent from "@/components/CartContent";

export const metadata = {
  title: "Keranjang Belanja — TopAssist",
  description: "Lihat dan kelola produk di keranjang belanja Anda.",
};

export default function KeranjangPage() {
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h1 className="text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
              Keranjang Belanja
            </h1>
          </div>
        </section>

        <section className="bg-[#e9f4ff] py-6 sm:py-8 lg:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <CartContent />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
