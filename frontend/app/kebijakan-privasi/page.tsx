import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function KebijakanPrivasi() {
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
            <Lock className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Kebijakan Privasi</h1>
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
              Di TopAssist, kami sangat menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan informasi pribadi Anda saat Anda mengunjungi atau melakukan pembelian di website kami.
            </p>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">2. Informasi yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Informasi Pribadi:</strong> Nama, alamat email, nomor WhatsApp, alamat pengiriman, dan titik koordinat (latitude/longitude) jika Anda mengizinkan akses lokasi.</li>
              <li><strong>Informasi Transaksi:</strong> Rincian pesanan, bukti pembayaran, dan riwayat belanja Anda.</li>
              <li><strong>Data Otomatis:</strong> Saat Anda mengunjungi web, kami otomatis menerima data perangkat (alamat IP, jenis browser, waktu akses) untuk keperluan keamanan dan optimisasi.</li>
            </ul>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">3. Penggunaan Informasi</h2>
            <p>Kami menggunakan informasi yang kami kumpulkan untuk berbagai tujuan, termasuk:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memproses pesanan dan mengelola pengiriman barang Anda.</li>
              <li>Mengirimkan notifikasi terkait status pesanan (melalui sistem In-App atau Bot WhatsApp).</li>
              <li>Meningkatkan layanan, fitur, dan pengalaman pengguna website kami.</li>
              <li>Mendeteksi, mencegah, dan menangani masalah keamanan teknis atau penipuan.</li>
            </ul>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">4. Berbagi Informasi</h2>
            <p>
              Kami tidak pernah menjual, menyewakan, atau memperdagangkan informasi pribadi Anda kepada pihak luar. Kami hanya membagikan informasi kepada pihak ketiga tepercaya (seperti jasa kurir ekspedisi dan penyedia gateway pembayaran) semata-mata untuk memfasilitasi transaksi dan pengiriman pesanan Anda.
            </p>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">5. Keamanan Data</h2>
            <p>
              Kami mengimplementasikan berbagai langkah keamanan untuk menjaga keselamatan informasi pribadi Anda. Kata sandi (password) dienkripsi secara ketat di database kami. Namun, tidak ada metode transmisi data melalui internet yang 100% aman, sehingga kami tidak dapat menjamin keamanan absolut.
            </p>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">6. Hak Pengguna</h2>
            <p>
              Anda berhak untuk mengakses, memperbarui, atau meminta penghapusan informasi pribadi Anda. Anda dapat mengedit profil Anda melalui halaman Edit Profil atau menghubungi kami untuk bantuan lebih lanjut.
            </p>

            <h2 className="mt-8 text-xl font-bold text-[#163f73]">7. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan lebih lanjut terkait Kebijakan Privasi ini, jangan ragu untuk menghubungi kami melalui WhatsApp di 0815-7799-036 atau melalui email hibahjarpaktopassist@gmail.com.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
