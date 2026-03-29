import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <span className="text-lg font-bold text-white">
                Top<span className="text-blue-400">Production</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Konveksi tas dan produk custom berkualitas tinggi. Diproduksi langsung oleh
              pengrajin berpengalaman dengan harga terjangkau.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Menu
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/" className="hover:text-blue-400 transition-colors">Beranda</a></li>
              <li><a href="/toko" className="hover:text-blue-400 transition-colors">Toko</a></li>
              <li><a href="/kontak" className="hover:text-blue-400 transition-colors">Kontak</a></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Kontak
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>Jl. Contoh Alamat No. 123, Kota, Indonesia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                <span>+62 812-XXXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                <span>info@topproduction.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Senin – Sabtu, 08.00 – 17.00</span>
              </li>
            </ul>
          </div>

          {/* Map placeholder */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Lokasi
            </h3>
            <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 aspect-[4/3] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="mx-auto mb-2 h-8 w-8" />
                <p className="text-xs font-medium">Google Maps</p>
                <p className="text-[10px]">Akan ditambahkan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Top Production. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
