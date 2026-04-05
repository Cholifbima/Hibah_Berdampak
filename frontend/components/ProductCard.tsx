import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discounts.length > 0;
  const hasImage = !!product.gambar_url;

  const discountPercent = hasDiscount
    ? Math.round(((product.harga_satuan - product.discounts[0].harga_grosir) / product.harga_satuan) * 100)
    : 0;

  return (
    <Link href={`/toko/${product.id_product}`} className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow">
      {/* Badge Best Seller */}
      <div className="absolute top-3 left-3 z-10">
        <div className="rounded-xl bg-gradient-to-r from-[#dca951] to-[#efd286] px-3 py-1.5 sm:px-4 sm:py-2">
          <span className="text-[10px] font-semibold text-[#382317] sm:text-xs">
            BEST SELLER
          </span>
        </div>
      </div>

      {/* Gambar produk */}
      <div className="relative aspect-square bg-gradient-to-b from-white to-[#f0f6ff] p-4">
        {hasImage ? (
          <Image
            src={product.gambar_url!}
            alt={product.nama_produk}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl">🛍️</span>
          </div>
        )}

        {product.stok === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold text-white sm:text-xs">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Info produk */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
        {/* Nama */}
        <h3 className="text-center text-xs font-semibold leading-snug text-[#373737] line-clamp-2 sm:text-sm">
          {product.nama_produk}
        </h3>

        {/* Harga coret (jika ada diskon) */}
        {hasDiscount && (
          <p className="mt-1.5 text-xs text-gray-400 line-through sm:text-sm">
            {formatRupiah(product.harga_satuan)}
          </p>
        )}

        {/* Harga + Badge diskon */}
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm font-extrabold text-[#163f73] sm:text-lg">
            {hasDiscount
              ? formatRupiah(product.discounts[0].harga_grosir)
              : formatRupiah(product.harga_satuan)}
          </p>
          {hasDiscount && discountPercent > 0 && (
            <span className="rounded-lg bg-[#c3dcff] px-2 py-0.5 text-[10px] font-extrabold text-[#163f73] sm:text-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Info grosir */}
        {hasDiscount && (
          <div className="mt-2 rounded-xl bg-[#163f73] px-3 py-1.5">
            <p className="text-[9px] font-extrabold text-white sm:text-[11px]">
              Beli {product.discounts[0].min_qty} : {formatRupiah(product.discounts[0].harga_grosir)} / pcs
            </p>
          </div>
        )}

        {/* Rating & Terjual */}
        <div className="mt-2 flex items-center gap-1.5 text-[#373737]">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] font-semibold sm:text-xs">5.0</span>
          <span className="mx-0.5 text-gray-300">|</span>
          <span className="text-[11px] sm:text-xs">
            {product.stok > 0 ? `${product.stok} Stok` : "Habis"}
          </span>
        </div>
      </div>
    </Link>
  );
}
