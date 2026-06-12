import { ShieldCheck, Package, Star, Truck } from "lucide-react";

const STATS = [
  { icon: Package, value: "50+", label: "Produk Tersedia" },
  { icon: Star, value: "4.9", label: "Rating Rata-rata" },
  { icon: ShieldCheck, value: "100%", label: "Produk Berkualitas" },
  { icon: Truck, value: "Cepat", label: "Pengiriman Ke Seluruh Indonesia" },
];

export default function StatsBar() {
  return (
    <div className="bg-white py-5 sm:py-6 shadow-sm relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-gray-100">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 sm:justify-center sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9f4ff]">
                <Icon className="h-5 w-5 text-[#163f73]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#163f73] sm:text-base">{value}</p>
                <p className="text-[10px] leading-tight text-gray-500 sm:text-[11px] font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
