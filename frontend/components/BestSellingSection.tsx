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
        <h2 className="text-center text-2xl font-bold text-black drop-shadow-sm sm:text-3xl lg:text-4xl">
          Produk Terlaris
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:mt-12">
          {products.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <a
            href="/toko"
            className="inline-flex items-center rounded-2xl border-2 border-[#08519c] px-8 py-3 text-sm font-light uppercase text-[#08519c] hover:bg-[#08519c] hover:text-white transition-colors sm:px-10 sm:text-base"
          >
            lihat semua
          </a>
        </div>
      </div>
    </section>
  );
}
