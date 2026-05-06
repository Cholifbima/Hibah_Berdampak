import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";

export const metadata = {
  title: "Form Pemesanan — TopAssist",
  description: "Isi form pemesanan dan kirim langsung via WhatsApp.",
};

export default function PemesananPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-[#e9f4ff] pt-[72px] sm:pt-[80px]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <OrderForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
