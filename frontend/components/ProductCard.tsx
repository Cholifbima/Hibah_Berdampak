import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/api";
import { getProductThumbnail } from "@/lib/product-gallery";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasGrosir = product.harga_grosir && product.harga_grosir > 0;
  const hasDiskon = product.harga_asli && product.harga_satuan && product.harga_asli > product.harga_satuan;
  const thumbnail = getProductThumbnail(product.gambar_url);
  const hasImage = !!thumbnail;

  const calculatedDiscount = hasDiskon
    ? Math.round(((product.harga_asli! - product.harga_satuan) / product.harga_asli!) * 100)
    : 0;
  const discountPercent = calculatedDiscount > 0 ? calculatedDiscount : (product.diskon_persen ?? 0);

  return (
    <Link
      href={`/toko/detail?id=${product.id_product}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-2 hover:ring-[#163f73]/25 hover:shadow-2xl hover:shadow-[#163f73]/12"
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
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#dbeeff] via-[#eaf4ff] to-[#f5f9ff]">
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
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3">
        {/* Nama */}
        <h3 className="text-[11px] font-bold leading-snug text-gray-800 line-clamp-2 sm:text-[13px]">
          {product.nama_produk}
        </h3>

        {/* Harga */}
        <div className="mt-2">
          {hasDiskon && product.harga_asli && (
            <p className="text-[10px] text-gray-400 line-through sm:text-[11px]">
              {formatRupiah(product.harga_asli)}
            </p>
          )}
          <p className="text-sm font-extrabold text-[#163f73] sm:text-base">
            {formatRupiah(product.harga_satuan)}
          </p>
        </div>

        {/* Grosir info strip */}
        {hasGrosir && product.min_grosir && (
          <div className="mt-1.5 rounded-lg border border-[#c3dcff] bg-[#eef6ff] px-2 py-1">
            <p className="text-[9px] font-bold text-[#163f73] sm:text-[10px]">
              🏷️ Grosir ≥{product.min_grosir} pcs · {formatRupiah(product.harga_grosir ?? 0)}/pcs
            </p>
          </div>
        )}

        {/* Rating & Stok */}
        <div className="mt-2 flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-semibold text-gray-600 sm:text-[11px]">{(product.rating ?? 5).toFixed(1)}</span>
          <span className="text-gray-200">·</span>
          <span className="text-[10px] text-gray-400 sm:text-[11px]">
            {product.stok > 0 ? `${product.stok} stok` : "Habis"}
          </span>
        </div>

        {/* CTA Button */}
        <div className="mt-2.5">
          <span className="block w-full rounded-xl bg-gradient-to-r from-[#163f73] to-[#1e5799] py-2 text-center text-[10px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:brightness-110 sm:text-[11px]">
            Lihat Produk
          </span>
        </div>
      </div>
    </Link>
  );
}
