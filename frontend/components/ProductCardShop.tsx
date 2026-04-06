import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/api";

interface ProductCardShopProps {
  product: Product;
}

export default function ProductCardShop({ product }: ProductCardShopProps) {
  const hasImage = !!product.gambar_url;
  const hasDiscount = product.discounts.length > 0;

  return (
    <Link href={`/toko/${product.id_product}`} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Gambar produk — background biru konsisten */}
      <div className="relative aspect-square bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
        {hasImage ? (
          <Image
            src={product.gambar_url!}
            alt={product.nama_produk}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
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

        {hasDiscount && product.stok > 0 && (
          <div className="absolute top-2 right-2">
            <span className="rounded-lg bg-[#163f73] px-2 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">
              GROSIR
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="text-[11px] font-semibold leading-snug text-[#373737] line-clamp-2 sm:text-xs">
          {product.nama_produk}
        </h3>

        <p className="mt-1 text-xs font-extrabold text-[#163f73] sm:text-sm">
          {formatRupiah(product.harga_satuan)}
        </p>

        <div className="mt-1.5 flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-gray-500 sm:text-[11px]">5.0</span>
          <span className="mx-0.5 text-gray-300">·</span>
          <span className="text-[10px] text-gray-400 sm:text-[11px]">
            {product.stok > 0 ? `Stok ${product.stok}` : "Habis"}
          </span>
        </div>
      </div>
    </Link>
  );
}
