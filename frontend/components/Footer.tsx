import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="kontak" className="relative overflow-hidden bg-white text-gray-600 border-t border-gray-100">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 pt-10 pb-6 sm:pt-14 lg:pt-16">
        {/* Logo & deskripsi */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
            alt="TopAssist"
            width={64}
            height={64}
            className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16 shadow-sm border border-gray-100"
          />
          <span className="text-2xl font-extrabold text-[#163f73] drop-shadow-sm sm:text-3xl">
            TopAssist
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed sm:text-base lg:max-w-xl text-gray-500 font-medium">
          Temukan berbagai produk berkualitas untuk keperluan hobi maupun fashion anda.
        </p>

        {/* LAYANAN PELANGGAN */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-[family-name:var(--font-roboto-slab)] text-base font-bold uppercase text-[#163f73] sm:text-lg">
            LAYANAN PELANGGAN
          </h3>

          <div className="mt-3 flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-[#163f73]">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed sm:text-base text-gray-600">
              <p className="font-semibold text-gray-800">Jam Operasional:</p>
              <p className="font-medium">Senin - Sabtu (10.00 - 17.00 WIB)</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 inline-block">
            <p className="text-xs font-bold text-amber-700 sm:text-sm">
              Hari Minggu &amp; Tanggal Merah tetap ada pengiriman.
            </p>
          </div>
        </div>

        {/* TAUTAN CEPAT */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-[family-name:var(--font-roboto-slab)] text-base font-bold uppercase text-[#163f73] sm:text-lg">
            TAUTAN CEPAT
          </h3>
          <ul className="mt-3 space-y-2 text-sm sm:text-base font-medium">
            <li>
              <a href="/" className="capitalize text-gray-600 hover:text-[#0066ff] transition-colors">Beranda</a>
            </li>
            <li>
              <a href="/toko" className="capitalize text-gray-600 hover:text-[#0066ff] transition-colors">Top</a>
            </li>
            <li>
              <a href="/toko" className="capitalize text-gray-600 hover:text-[#0066ff] transition-colors">Katalog Produk</a>
            </li>
          </ul>
        </div>

        {/* HUBUNGI KAMI */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-[family-name:var(--font-roboto-slab)] text-base font-bold uppercase text-[#163f73] sm:text-lg">
            HUBUNGI KAMI
          </h3>

          {/* Kontak langsung */}
          <div className="mt-3 space-y-3 font-medium">
            <a
              href="https://wa.me/6208157799036"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#25d366] transition-colors"
            >
              {/* WhatsApp icon */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#25d366] transition-colors hover:bg-green-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <span>0815-7799-036</span>
            </a>

            <a
              href="mailto:hibahjarpaktopassist@gmail.com"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#0066ff] transition-colors"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0066ff] transition-colors">
                <Mail className="h-5 w-5" />
              </span>
              <span>hibahjarpaktopassist@gmail.com</span>
            </a>
          </div>

          {/* Marketplace & Social */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Temukan kami di</p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=100067483230790"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200 hover:ring-[#1877f2] hover:shadow-md transition-all"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#1877f2]">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Shopee */}
              <a
                href="https://shopee.co.id/top.production06"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 overflow-hidden items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200 hover:ring-[#ee4d2d] hover:shadow-md transition-all p-1.5"
                title="Shopee"
              >
                <Image src="/assets/icons/IkonHibah/shoope.png" alt="Shopee" width={32} height={32} className="w-full h-full object-contain" />
              </a>

              {/* Lazada */}
              <a
                href="https://s.lazada.co.id/s.ZkgOfO"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 overflow-hidden items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200 hover:ring-[#0f146d] hover:shadow-md transition-all p-1.5"
                title="Lazada"
              >
                <Image src="/assets/icons/IkonHibah/lazada.png" alt="Lazada" width={32} height={32} className="w-full h-full object-contain" />
              </a>
            </div>
          </div>

          {/* Alamat */}
          <div className="mt-6 flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-[#163f73]">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-sm leading-relaxed text-gray-600 font-medium">
              SAMPING (selatan) KEBUGARAN SOLO &amp; SPA, PAGER MERAH ada POHON MANGGA,
              Jl. Mojo No.18A, Karangasem, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57145
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-200 pt-5">
          <p className="text-center text-xs font-medium text-gray-500 sm:text-sm">
            © 2026 TopAssist Bag Store. All right reserved.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium text-gray-500 sm:text-sm">
            <a href="#" className="hover:text-[#163f73] transition-colors">
              Syarat &amp; Ketentuan
            </a>
            <span className="h-3 w-px bg-gray-300" />
            <a href="#" className="hover:text-[#163f73] transition-colors">
              Kebijakan &amp; Privasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
