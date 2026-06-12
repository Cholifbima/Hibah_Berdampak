import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { formatRupiah, type Product } from "@/lib/api";
import { getProductThumbnail } from "@/lib/product-gallery";

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
          {display.map((product, i) => {
            const thumbnail = getProductThumbnail(product.gambar_url);
            const hasDiscount = product.harga_asli && product.harga_satuan && product.harga_asli > product.harga_satuan;
            
            const calculatedDiscount = hasDiscount
              ? Math.round(((product.harga_asli! - product.harga_satuan) / product.harga_asli!) * 100)
              : 0;
            const discountPercent = calculatedDiscount > 0 ? calculatedDiscount : (product.diskon_persen ?? 0);

            return (
              <ScrollReveal key={product.id_product} delay={i * 60} direction="up">
                <Link
                  href={`/toko/detail?id=${product.id_product}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#163f73]/12"
                >
                  {/* Gambar */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-[#f5faff] to-[#e9f4ff]">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={product.nama_produk}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 22vw"
                        className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-3xl">🛍️</span>
                      </div>
                    )}
                    {product.stok === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold text-white">
                          Stok Habis
                        </span>
                      </div>
                    )}
                    {hasDiscount && product.stok > 0 && (
                      <div className="absolute top-2 right-2 rounded-lg bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        -{discountPercent}%
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                    <h3 className="text-[11px] font-semibold leading-snug text-[#373737] line-clamp-2 sm:text-xs">
                      {product.nama_produk}
                    </h3>

                    {hasDiscount && product.harga_asli && (
                      <p className="mt-1.5 text-[10px] text-gray-400 line-through">
                        {formatRupiah(product.harga_asli)}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm font-extrabold text-[#163f73] sm:text-base">
                      {formatRupiah(product.harga_satuan)}
                    </p>

                    <div className="mt-1.5 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] text-gray-500">{(product.rating ?? 5).toFixed(1)}</span>
                      <span className="mx-0.5 text-gray-300">·</span>
                      <span className="text-[10px] text-gray-400">
                        {product.stok > 0 ? `Stok ${product.stok}` : "Habis"}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <span className="block w-full rounded-xl bg-[#163f73] py-2 text-center text-[10px] font-bold uppercase tracking-wide text-white transition-colors duration-200 group-hover:bg-[#1a4f8f] sm:text-[11px]">
                        Lihat Produk
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={200} direction="up">
          <div className="mt-8 text-center sm:mt-10">
            <Link
              href="/toko"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#163f73] bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-[#163f73] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#163f73] hover:text-white hover:shadow-lg sm:px-10 sm:text-base"
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
