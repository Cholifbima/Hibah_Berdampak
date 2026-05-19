"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star, Truck, ShieldCheck, MessageCircle, Loader2, ExternalLink, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import { fetchProductById, formatRupiah, type Product } from "@/lib/api";
import { getProductGallery } from "@/lib/product-gallery";

function ProductDetailInner() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  const productId = rawId ? parseInt(rawId, 10) : NaN;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isNaN(productId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProductById(productId)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-[#e9f4ff] pt-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#163f73]" />
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-4 bg-[#e9f4ff] pt-24">
          <p className="text-lg font-semibold text-[#163f73]">Produk tidak ditemukan</p>
          <Link href="/toko" className="text-sm font-medium text-[#163f73] underline">
            Kembali ke Toko
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const gallery = getProductGallery(product.gambar_url);
  const hasDiscount = product.discounts.length > 0;
  const lowestGrosir = hasDiscount
    ? Math.min(...product.discounts.map((d) => d.harga_grosir))
    : null;
  const discountPercent = hasDiscount && lowestGrosir
    ? Math.round(((product.harga_satuan - lowestGrosir) / product.harga_satuan) * 100)
    : 0;
  const paragraphs = product.deskripsi
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <section className="bg-[#e9f4ff] pt-24 pb-6 sm:pt-32 sm:pb-10 lg:pt-36 lg:pb-12">
          <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6">
            <Link
              href="/toko"
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#163f73]/70 hover:text-[#163f73] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali
            </Link>
            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
              <div className="min-w-0 max-w-full">
                {gallery.length > 0 ? (
                  <ProductGallery images={gallery} productName={product.nama_produk} />
                ) : (
                  <div className="flex aspect-square max-w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
                    <span className="text-5xl">🛍️</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 max-w-full">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#163f73]/60 sm:text-sm">
                  {product.kategori}
                </p>

                <h1 className="mt-1.5 max-w-full break-words text-xl font-bold leading-snug text-[#1a1a1a] [overflow-wrap:anywhere] sm:text-2xl lg:text-3xl">
                  {product.nama_produk}
                </h1>

                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <div className="flex shrink-0 items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#373737]">5.0</span>
                  <span className="shrink-0 text-sm text-gray-400">|</span>
                  <span className="min-w-0 text-sm text-gray-500">
                    {product.stok > 0 ? `Stok tersedia: ${product.stok}` : "Stok habis"}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                  {hasDiscount && (
                    <p className="text-sm text-gray-400 line-through sm:text-base">
                      {formatRupiah(product.harga_satuan)}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-extrabold text-[#163f73] sm:text-3xl">
                      {hasDiscount && lowestGrosir
                        ? formatRupiah(lowestGrosir)
                        : formatRupiah(product.harga_satuan)}
                    </p>
                    {hasDiscount && discountPercent > 0 && (
                      <span className="rounded-lg bg-[#c3dcff] px-2 py-0.5 text-xs font-extrabold text-[#163f73] sm:text-sm">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {hasDiscount && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#163f73] sm:text-sm">
                        Harga Grosir
                      </p>
                      <div className="space-y-1.5">
                        {product.discounts.map((d) => (
                          <div
                            key={d.id_discount}
                            className="flex items-center justify-between rounded-xl bg-[#163f73] px-4 py-2.5"
                          >
                            <span className="text-xs font-semibold text-white sm:text-sm">
                              Beli ≥ {d.min_qty} pcs
                            </span>
                            <span className="text-sm font-extrabold text-white sm:text-base">
                              {formatRupiah(d.harga_grosir)} / pcs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 text-center shadow-sm">
                    <Truck className="h-5 w-5 text-[#163f73]" />
                    <span className="text-[10px] font-medium text-gray-600 sm:text-xs">Pengiriman Cepat</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 text-center shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-[#163f73]" />
                    <span className="text-[10px] font-medium text-gray-600 sm:text-xs">Kualitas Terjamin</span>
                  </div>
                  <a
                    href={`https://wa.me/628157799036?text=${encodeURIComponent(`Halo, saya ingin bertanya tentang produk: ${product.nama_produk}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 text-center shadow-sm hover:bg-green-50 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    <span className="text-[10px] font-medium text-gray-600 sm:text-xs">Chat Penjual</span>
                  </a>
                </div>

                <AddToCartButton product={product} />

                {(product.link_shopee || product.link_tokopedia || product.link_lazada) && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Beli di e-commerce lain</p>
                    <div className="flex flex-wrap gap-2">
                      {product.link_shopee && (
                        <a
                          href={product.link_shopee}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#EE4D2D] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-white p-0.5">
                            <img src="/assets/icons/IkonHibah/shoope.png" alt="" className="h-full w-full object-contain" />
                          </span>
                          Shopee
                          <ExternalLink className="h-3 w-3 opacity-80" />
                        </a>
                      )}
                      {product.link_tokopedia && (
                        <a
                          href={product.link_tokopedia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#03AC0E] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                        >
                          <img src="https://logo.clearbit.com/tokopedia.com" alt="" className="h-5 w-5 rounded-sm object-contain" />
                          Tokopedia
                          <ExternalLink className="h-3 w-3 opacity-80" />
                        </a>
                      )}
                      {product.link_lazada && (
                        <a
                          href={product.link_lazada}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#F57224] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                        >
                          <img src="https://logo.clearbit.com/lazada.co.id" alt="" className="h-5 w-5 rounded-sm object-contain" />
                          Lazada
                          <ExternalLink className="h-3 w-3 opacity-80" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
              <h2 className="text-lg font-bold text-[#163f73] sm:text-xl">Deskripsi Produk</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                {paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-[#e9f4ff] pt-24">
            <Loader2 className="h-10 w-10 animate-spin text-[#163f73]" />
          </div>
          <Footer />
        </>
      }
    >
      <ProductDetailInner />
    </Suspense>
  );
}
