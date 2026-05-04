import ProductCard from "./ProductCard";
import { type Product } from "@/lib/api";

interface BestSellingSectionProps {
  products: Product[];
}

export default function BestSellingSection({ products }: BestSellingSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      id="produk-terlaris"
      className="scroll-mt-16 bg-[#e9f4ff] py-10 sm:py-14 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#163f73]/70 sm:text-sm">
            Pilihan favorit
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#0f2d55] sm:text-3xl lg:text-4xl">
            Produk Terlaris
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#163f73] to-[#3d8fd4]" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:mt-12">
          {products.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <a
            href="/toko"
            className="inline-flex items-center rounded-full border-2 border-[#163f73] bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wide text-[#163f73] shadow-md shadow-[#163f73]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163f73] hover:text-white hover:shadow-lg sm:px-10 sm:text-base"
          >
            lihat semua
          </a>
        </div>
      </div>
    </section>
  );
}
