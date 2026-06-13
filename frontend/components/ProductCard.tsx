import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/api";
import { getProductThumbnail } from "@/lib/product-gallery";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Logika diskon coret (retail)
  const hasDiskon = product.harga_asli && product.harga_satuan && product.harga_asli > product.harga_satuan;
  const calculatedDiscount = hasDiskon
    ? Math.round(((product.harga_asli! - product.harga_satuan) / product.harga_asli!) * 100)
    : 0;
  const discountPercent = calculatedDiscount > 0 ? calculatedDiscount : (product.diskon_persen ?? 0);

  // Logika harga grosir (valid hanya jika lebih murah dari eceran)
  const validDiscounts = product.discounts?.filter(d => d.harga_grosir < product.harga_satuan) || [];
  const firstDiscount = validDiscounts.length > 0 
    ? validDiscounts.reduce((min, d) => d.min_qty < min.min_qty ? d : min, validDiscounts[0]) 
    : null;
  const showGrosir = !!firstDiscount || (product.min_grosir && product.harga_grosir && product.harga_grosir < product.harga_satuan);
  const grosirMin = firstDiscount?.min_qty || product.min_grosir;
  const grosirHarga = firstDiscount?.harga_grosir || product.harga_grosir;

  const thumbnail = getProductThumbnail(product.gambar_url);
  const hasImage = !!thumbnail;

  return (
    <Link
      href={`/toko/detail?id=${product.id_product}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md shadow-gray-200/50 border border-gray-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#163f73]/30 hover:shadow-xl hover:shadow-[#163f73]/10"
    >
      {/* Badge Best Seller */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#f5a623] to-[#f7c948] px-2.5 py-1 shadow-md">
          <Star className="h-2.5 w-2.5 fill-[#382317] text-[#382317]" />
          <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#382317] sm:text-[10px]">
            Best Seller
          </span>
        </div>
      </div>

      {/* Discount badge top right */}
      {hasDiskon && discountPercent > 0 && product.stok > 0 && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="rounded-lg bg-red-500 px-2 py-1 shadow-md">
            <span className="text-[9px] font-extrabold text-white sm:text-[10px]">-{discountPercent}%</span>
          </div>
        </div>
      )}

      {/* Gambar produk */}
      <div className="relative aspect-square overflow-hidden bg-white border-b border-gray-100">
        {hasImage ? (
          <Image
            src={thumbnail!}
            alt={product.nama_produk}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            style={{ padding: "10%" }}
            quality={90}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">🛍️</span>
          </div>
        )}

        {product.stok === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <span className="rounded-full bg-gray-700 px-3 py-1 text-[10px] font-bold text-white sm:text-xs">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Info produk */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Nama */}
        <h3 className="text-xs font-bold leading-relaxed text-gray-800 line-clamp-2 sm:text-sm">
          {product.nama_produk}
        </h3>

        {/* Wrapper Bawah (Harga, Grosir, Rating, Button) yang selalu rata */}
        <div className="mt-auto flex flex-col pt-2">
          {/* Harga */}
          <div className="flex flex-col">
            {hasDiskon && product.harga_asli && (
              <p className="text-[10px] text-gray-400 line-through sm:text-xs">
                {formatRupiah(product.harga_asli)}
              </p>
            )}
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-extrabold text-[#163f73] sm:text-base">
                {formatRupiah(product.harga_satuan)}
              </p>
            </div>
          </div>

          {/* Grosir info strip (Clean Text) */}
          {showGrosir && grosirMin && grosirHarga && (
            <p className="mt-1 text-[10px] font-semibold text-[#0066ff] sm:text-xs">
              Grosir ≥{grosirMin} pcs: {formatRupiah(grosirHarga)}
            </p>
          )}

          {/* Wrapper Bottom (Rating & Button) */}
          <div className="mt-3 flex flex-col gap-2.5">
            {/* Rating & Stok */}
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-gray-700 sm:text-xs">
                {(product.rating ?? 5).toFixed(1)}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
                {product.stok > 0 ? `${product.stok} stok` : "Habis"}
              </span>
            </div>

            {/* CTA Button */}
            <span className="block w-full rounded-xl bg-[#163f73] py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 group-hover:bg-[#0066ff] sm:text-xs">
              Lihat Produk
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
