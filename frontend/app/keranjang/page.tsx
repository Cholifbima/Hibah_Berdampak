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
      <main
        className="flex-1 min-h-screen pt-[72px]"
        style={{
          background: "#e9f4ff",
        }}
      >
        {/* Header biru */}
        <div
          className="px-4 pb-5 pt-5 sm:px-6"
          style={{
            background:
              "linear-gradient(180deg, rgb(31, 103, 223) 0%, rgb(22, 63, 115) 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <h1 className="text-xl font-extrabold text-white sm:text-2xl">
              Keranjang Belanja
            </h1>
            <p className="mt-0.5 text-sm text-white/70">
              Periksa produk pilihan Anda sebelum melanjutkan pemesanan.
            </p>
          </div>
        </div>

        {/* Konten keranjang */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <CartContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
