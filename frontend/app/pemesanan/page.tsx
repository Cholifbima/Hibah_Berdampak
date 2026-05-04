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
      <main
        className="flex-1 min-h-screen pt-[72px]"
        style={{
          background:
            "linear-gradient(180deg, rgb(31, 103, 223) 0%, rgb(22, 63, 115) 60%, rgb(15, 45, 85) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-5">
            <h1 className="text-xl font-extrabold text-white sm:text-2xl">
              Form Pemesanan
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Lengkapi data di bawah, pesanan akan dikirim langsung ke WhatsApp kami.
            </p>
          </div>
          <OrderForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
