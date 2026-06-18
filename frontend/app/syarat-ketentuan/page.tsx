import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function SyaratKetentuan() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-gradient-to-r from-[#163f73] to-[#1f67df] pb-16 pt-24">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link href="/" className="group mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-white/80 transition-colors hover:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Syarat & Ketentuan</h1>
              <p className="mt-2 text-base text-white/70">Pembaruan Terakhir: 18 Juni 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-4xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-[#163f73]/5 ring-1 ring-gray-100 sm:p-10">
          <div className="prose prose-blue max-w-none text-gray-600">
            <h2 className="text-xl font-bold text-[#163f73]">1. Pendahuluan</h2>
            <p>
              Selamat datang di TopAssist. Dengan mengakses dan menggunakan layanan kami, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami.
            </p>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">2. Layanan dan Pemesanan</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pemesanan hanya dapat dilakukan oleh pengguna yang telah mendaftar dan memiliki akun aktif.</li>
              <li>TopAssist berhak membatalkan pesanan apabila terdapat indikasi kecurangan, stok habis, atau kesalahan harga pada sistem.</li>
              <li>Harga yang tertera dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.</li>
            </ul>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">3. Pembayaran</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pembayaran harus dilakukan sesuai dengan metode yang tersedia pada saat checkout.</li>
              <li>Pembeli wajib mengunggah bukti pembayaran yang sah jika menggunakan metode transfer manual.</li>
              <li>Pesanan tidak akan diproses sebelum pembayaran dikonfirmasi oleh pihak TopAssist.</li>
            </ul>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">4. Pengiriman</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pengiriman dilakukan melalui layanan kurir pihak ketiga yang dipilih oleh pembeli.</li>
              <li>TopAssist tidak bertanggung jawab atas keterlambatan pengiriman yang disebabkan oleh pihak kurir.</li>
              <li>Nomor resi akan diberikan setelah pesanan diserahkan ke pihak ekspedisi.</li>
            </ul>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">5. Retur dan Pengembalian Dana</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Permintaan pengembalian barang hanya dilayani jika produk yang diterima cacat produksi atau tidak sesuai pesanan.</li>
              <li>Keluhan wajib disertai dengan video unboxing lengkap tanpa jeda (cut).</li>
              <li>Proses pengembalian dana memakan waktu 3-7 hari kerja setelah barang retur diterima oleh kami.</li>
            </ul>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">6. Hak Kekayaan Intelektual</h2>
            <p>
              Seluruh konten yang terdapat di website ini, termasuk namun tidak terbatas pada teks, grafis, logo, dan gambar adalah milik TopAssist atau pemasok kontennya dan dilindungi oleh undang-undang hak cipta.
            </p>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">7. Perubahan Syarat dan Ketentuan</h2>
            <p>
              TopAssist berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian mana pun dari Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah diposting di website ini.
            </p>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">8. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di WhatsApp 0815-7799-036 atau email hibahjarpaktopassist@gmail.com.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
