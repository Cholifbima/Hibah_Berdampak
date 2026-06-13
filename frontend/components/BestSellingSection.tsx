import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";
import { type Product } from "@/lib/api";

interface BestSellingSectionProps {
  products: Product[];
}

export default function BestSellingSection({ products }: BestSellingSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      id="produk-terlaris"
      className="scroll-mt-16 py-10 sm:py-14 lg:py-20"
      style={{ background: "linear-gradient(180deg, #f0f7ff 0%, #e4f0ff 100%)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal direction="up">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-extrabold text-[#0f2d55] sm:text-3xl lg:text-4xl">
              Produk Terlaris
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#163f73] to-[#4a9de0]" />
          </div>
        </ScrollReveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:mt-12">
          {products.map((product, i) => (
            <ScrollReveal key={product.id_product} delay={i * 80} direction="up" className="h-full">
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <a
            href="/toko"
            className="group inline-flex items-center gap-2 rounded-full bg-[#163f73] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#163f73]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f2d55] hover:shadow-xl sm:px-10 sm:text-base"
          >
            Lihat Semua
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
