import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import { fetchProductById, formatRupiah } from "@/lib/api";
import { getProductGallery } from "@/lib/product-gallery";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  let product;
  try {
    product = await fetchProductById(productId);
  } catch {
    notFound();
  }

  const gallery = getProductGallery(product.gambar_url);
  const hasDiscount = product.discounts.length > 0;

  const paragraphs = product.deskripsi
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        {/* Header biru */}
        <section
          className="pt-20 pb-4 sm:pt-24 sm:pb-6"
          style={{
            background:
              "linear-gradient(180deg, rgb(31, 103, 223) 0%, rgb(28, 84, 179) 50%, rgb(24, 65, 136) 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Link
              href="/toko"
              className="inline-flex items-center gap-1.5 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Toko
            </Link>
          </div>
        </section>

        {/* Konten detail */}
        <section className="bg-[#e9f4ff] py-6 sm:py-8 lg:py-10">
          <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6">
            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
              {/* Kolom kiri — Galeri */}
              <div className="min-w-0 max-w-full">
                {gallery.length > 0 ? (
                  <ProductGallery images={gallery} productName={product.nama_produk} />
                ) : (
                  <div className="flex aspect-square max-w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
                    <span className="text-5xl">🛍️</span>
                  </div>
                )}
              </div>

              {/* Kolom kanan — Info */}
              <div className="min-w-0 max-w-full">
                {/* Kategori */}
                <p className="text-xs font-semibold uppercase tracking-wider text-[#163f73]/60 sm:text-sm">
                  {product.kategori}
                </p>

                {/* Nama — pastikan wrap di layar sempit (grid min-width fix + break-words) */}
                <h1 className="mt-1.5 max-w-full break-words text-xl font-bold leading-snug text-[#1a1a1a] [overflow-wrap:anywhere] sm:text-2xl lg:text-3xl">
                  {product.nama_produk}
                </h1>

                {/* Rating */}
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

                {/* Harga */}
                <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                  {hasDiscount && (
                    <p className="text-sm text-gray-400 line-through sm:text-base">
                      {formatRupiah(product.harga_satuan)}
                    </p>
                  )}
                  <p className="text-2xl font-extrabold text-[#163f73] sm:text-3xl">
                    {formatRupiah(product.harga_satuan)}
                  </p>

                  {/* Tabel grosir */}
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

                {/* Keunggulan */}
                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 text-center shadow-sm">
                    <Truck className="h-5 w-5 text-[#163f73]" />
                    <span className="text-[10px] font-medium text-gray-600 sm:text-xs">Pengiriman Cepat</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 text-center shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-[#163f73]" />
                    <span className="text-[10px] font-medium text-gray-600 sm:text-xs">Kualitas Terjamin</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 text-center shadow-sm">
                    <MessageCircle className="h-5 w-5 text-[#163f73]" />
                    <span className="text-[10px] font-medium text-gray-600 sm:text-xs">Chat Penjual</span>
                  </div>
                </div>

                {/* Tombol tambah ke keranjang */}
                <AddToCartButton product={product} />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
              <h2 className="text-lg font-bold text-[#163f73] sm:text-xl">
                Deskripsi Produk
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                {paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
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
