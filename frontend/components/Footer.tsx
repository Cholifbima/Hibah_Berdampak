import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="kontak" className="relative overflow-hidden bg-white text-gray-600 border-t border-gray-200">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-8 lg:pt-20">
        
        {/* Grid Container untuk konten utama */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          
          {/* Kolom 1: Brand & Deskripsi */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
                alt="TopAssist"
                width={72}
                height={72}
                className="h-16 w-16 rounded-full object-cover shadow-sm ring-1 ring-gray-100"
              />
              <span className="text-3xl font-extrabold tracking-tight text-[#163f73]">
                TopAssist
              </span>
            </div>
            <p className="text-base leading-relaxed text-gray-500 max-w-sm">
              Temukan berbagai produk berkualitas untuk keperluan hobi maupun fashion Anda dengan harga terbaik.
            </p>
            
            {/* Alamat */}
            <div className="mt-2 flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#0066ff]" />
              <p className="text-sm leading-relaxed text-gray-500 max-w-sm">
                Jl. Mojo No.18A, Karangasem, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57145
              </p>
            </div>
          </div>

          {/* Kolom 2: Layanan Pelanggan */}
          <div className="flex flex-col gap-6">
            <h3 className="font-[family-name:var(--font-roboto-slab)] text-sm font-black uppercase tracking-widest text-[#163f73]">
              Layanan Pelanggan
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#0066ff]" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-800">Jam Operasional:</p>
                  <p className="text-sm text-gray-500">Senin - Sabtu (10.00 - 17.00 WIB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom 3: Tautan Cepat */}
          <div className="flex flex-col gap-6">
            <h3 className="font-[family-name:var(--font-roboto-slab)] text-sm font-black uppercase tracking-widest text-[#163f73]">
              Tautan Cepat
            </h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="/" className="text-sm font-medium text-gray-500 hover:text-[#0066ff] transition-colors">Beranda</a>
              </li>
              <li>
                <a href="/toko" className="text-sm font-medium text-gray-500 hover:text-[#0066ff] transition-colors">Top</a>
              </li>
              <li>
                <a href="/toko" className="text-sm font-medium text-gray-500 hover:text-[#0066ff] transition-colors">Katalog Produk</a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Hubungi Kami & Sosial Media */}
          <div className="flex flex-col gap-6">
            <h3 className="font-[family-name:var(--font-roboto-slab)] text-sm font-black uppercase tracking-widest text-[#163f73]">
              Hubungi Kami
            </h3>
            <div className="flex flex-col gap-4">
              <a
                href="https://wa.me/6208157799036"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-[#25d366] transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-[#25d366]/10 group-hover:text-[#25d366] transition-colors">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                0815-7799-036
              </a>

              <a
                href="mailto:hibahjarpaktopassist@gmail.com"
                className="group flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-[#0066ff] transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-[#0066ff]/10 group-hover:text-[#0066ff] transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                Email Kami
              </a>
            </div>

            <div className="mt-2">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Sosial Media</h4>
              <div className="flex flex-wrap gap-3">
                <a href="https://www.facebook.com/profile.php?id=100067483230790" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 transition-all duration-300 hover:-translate-y-1 hover:bg-[#1877f2]/10 hover:shadow-md">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#1877f2] transition-transform duration-300 group-hover:scale-110">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://shopee.co.id/top.production06" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 p-2 transition-all duration-300 hover:-translate-y-1 hover:bg-[#ee4d2d]/10 hover:shadow-md">
                  <Image src="/assets/icons/IkonHibah/shoope.png" alt="Shopee" width={24} height={24} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </a>
                <a href="https://s.lazada.co.id/s.ZkgOfO" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 p-2 transition-all duration-300 hover:-translate-y-1 hover:bg-[#0f146d]/10 hover:shadow-md">
                  <Image src="/assets/icons/IkonHibah/lazada.png" alt="Lazada" width={24} height={24} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </a>
                <a href="https://www.tokopedia.com/topproduction-1" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 p-2 transition-all duration-300 hover:-translate-y-1 hover:bg-[#42b549]/10 hover:shadow-md">
                  <Image src="/assets/icons/IkonHibah/tokopedia.png" alt="Tokopedia" width={24} height={24} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </a>
                <a href="https://www.tiktok.com/@topproduction3?_r=1&_t=ZS-95aWmGWTqD7" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 p-2 transition-all duration-300 hover:-translate-y-1 hover:bg-[#000000]/10 hover:shadow-md">
                  <Image src="/assets/icons/IkonHibah/tiktokshop.png" alt="TikTok Shop" width={24} height={24} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </a>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bawah: Copyright & Links */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-sm font-medium text-gray-400">
            © 2026 TopAssist Bag Store. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-400">
            <Link href="/syarat-ketentuan" className="hover:text-[#163f73] transition-colors">Syarat &amp; Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-[#163f73] transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
