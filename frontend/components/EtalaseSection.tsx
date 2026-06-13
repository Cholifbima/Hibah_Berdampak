import Link from "next/link";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";
import { type Product } from "@/lib/api";

interface EtalaseSectionProps {
  products: Product[];
}

export default function EtalaseSection({ products }: EtalaseSectionProps) {
  const display = products.slice(0, 8);
  if (display.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 lg:py-20" style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal direction="up">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-extrabold text-[#0f2d55] sm:text-3xl lg:text-4xl">
              Etalase Produk
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#163f73] to-[#4a9de0]" />
          </div>
        </ScrollReveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:mt-12">
          {display.map((product, i) => (
            <ScrollReveal key={product.id_product} delay={i * 60} direction="up" className="h-full">
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200} direction="up">
          <div className="mt-8 text-center sm:mt-10">
            <Link
              href="/toko"
              className="group inline-flex items-center gap-2 rounded-full bg-[#163f73] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#163f73]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f2d55] hover:shadow-xl sm:px-10 sm:text-base"
            >
              Lihat Semua Produk
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
