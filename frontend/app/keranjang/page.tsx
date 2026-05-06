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
      <main className="flex-1 min-h-screen bg-[#e9f4ff] pt-[72px] sm:pt-[80px]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <CartContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
