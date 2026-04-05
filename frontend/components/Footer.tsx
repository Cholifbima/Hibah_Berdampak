import Image from "next/image";
import { Phone, Camera, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0f1f3d] text-[#adbddd]">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f3d] to-[#0a1528] opacity-90" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 pt-10 pb-6 sm:pt-14 lg:pt-16">
        {/* Logo & deskripsi */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/assets/icons/IkonHibah/logo_bg_white-small.png"
            alt="TopAssist"
            width={64}
            height={64}
            className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
          />
          <span className="text-2xl font-extrabold text-white drop-shadow-md sm:text-3xl">
            TopAssist
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed sm:text-base lg:max-w-xl">
          Temukan berbagai produk berkualitas untuk keperluan hobi maupun fashion anda.
        </p>

        {/* LAYANAN PELANGGAN */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-[family-name:var(--font-roboto-slab)] text-base font-medium uppercase text-white sm:text-lg">
            LAYANAN PELANGGAN
          </h3>

          <div className="mt-3 flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed sm:text-base">
              <p>Jam Operasional:</p>
              <p>Senin - Sabtu (10.00 - 17.00 WIB)</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-[#5e84bf] bg-[#182f58] px-4 py-2.5">
            <p className="text-xs text-[#e9d293] sm:text-sm">
              Hari Minggu &amp; Tanggal Merah tetap ada pengiriman.
            </p>
          </div>
        </div>

        {/* TAUTAN CEPAT */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-[family-name:var(--font-roboto-slab)] text-base font-medium uppercase text-white sm:text-lg">
            TAUTAN CEPAT
          </h3>
          <ul className="mt-3 space-y-2 text-sm sm:text-base">
            <li>
              <a href="/" className="capitalize hover:text-white transition-colors">Beranda</a>
            </li>
            <li>
              <a href="/toko" className="capitalize hover:text-white transition-colors">Top</a>
            </li>
            <li>
              <a href="/toko" className="capitalize hover:text-white transition-colors">Katalog Produk</a>
            </li>
          </ul>
        </div>

        {/* HUBUNGI KAMI */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-[family-name:var(--font-roboto-slab)] text-base font-medium uppercase text-white sm:text-lg">
            HUBUNGI KAMI
          </h3>

          {/* Social icons */}
          <div className="mt-3 flex items-center gap-3">
            <a
              href="tel:+"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#446498] bg-[#1c3561] hover:bg-[#244478] transition-colors"
            >
              <Phone className="h-5 w-5 text-[#adbddd]" />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#446498] bg-[#1c3561] hover:bg-[#244478] transition-colors"
            >
              <Camera className="h-5 w-5 text-[#adbddd]" />
            </a>
            <a
              href="mailto:info@topassist.id"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#446498] bg-[#1c3561] hover:bg-[#244478] transition-colors"
            >
              <Mail className="h-5 w-5 text-[#adbddd]" />
            </a>
          </div>

          {/* Alamat */}
          <div className="mt-4 flex items-start gap-3">
            <MapPin className="mt-0.5 h-6 w-6 shrink-0" />
            <p className="text-sm leading-relaxed sm:text-base">
              SAMPING (selatan) KEBUGARAN SOLO &amp; SPA, PAGER MERAH ada POHON MANGGA,
              Jl. Mojo No.18A, Karangasem, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57145
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-[#2a3f5f] pt-5">
          <p className="text-center text-xs capitalize sm:text-sm">
            © 2026 TopAssist Bag Store. All right reserved.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs capitalize sm:text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Syarat &amp; Ketentuan
            </a>
            <span className="h-4 w-px bg-[#3a5070]" />
            <a href="#" className="hover:text-white transition-colors">
              Kebijakan &amp; Privasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
