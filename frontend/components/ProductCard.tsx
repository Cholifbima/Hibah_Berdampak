import { Star } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const hasDiscount = product.discounts.length > 0;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${
        featured ? "sm:flex-row" : ""
      }`}
    >
      {/* Gambar placeholder */}
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 ${
          featured ? "sm:w-56 h-48 sm:h-auto" : "h-48"
        }`}
      >
        <div className="text-center p-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-300/50">
            <span className="text-lg">🛍️</span>
          </div>
          <p className="text-xs font-medium text-blue-700 line-clamp-2 leading-tight">
            {product.nama_produk}
          </p>
        </div>

        {product.stok === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              Stok Habis
            </span>
          </div>
        )}

        {hasDiscount && product.stok > 0 && (
          <div className="absolute top-2 left-2">
            <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[10px] font-bold text-yellow-900 shadow-sm">
              GROSIR
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`flex flex-1 flex-col p-4 ${featured ? "justify-center" : ""}`}>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
          {product.nama_produk}
        </h3>

        <p className="mt-2 text-base font-bold text-blue-700">
          {formatRupiah(product.harga_satuan)}
        </p>

        {hasDiscount && (
          <p className="mt-0.5 text-[11px] text-gray-400">
            Grosir mulai {formatRupiah(product.discounts[0].harga_grosir)}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">5.0</span>
          </div>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">
            Stok: {product.stok > 0 ? product.stok : "Habis"}
          </span>
        </div>
      </div>
    </div>
  );
}
