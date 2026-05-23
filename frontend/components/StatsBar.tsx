import { ShieldCheck, Package, Star, Truck } from "lucide-react";

const STATS = [
  { icon: Package, value: "50+", label: "Produk Tersedia" },
  { icon: Star, value: "4.9", label: "Rating Rata-rata" },
  { icon: ShieldCheck, value: "100%", label: "Produk Berkualitas" },
  { icon: Truck, value: "Cepat", label: "Pengiriman Ke Seluruh Indonesia" },
];

export default function StatsBar() {
  return (
    <div className="bg-[#163f73] py-4 sm:py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-white/15">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 sm:justify-center sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white sm:text-base">{value}</p>
                <p className="text-[10px] leading-tight text-white/60 sm:text-[11px]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
