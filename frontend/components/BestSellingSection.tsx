import ProductCard from "./ProductCard";
import { type Product } from "@/lib/api";

interface BestSellingSectionProps {
  products: Product[];
}

export default function BestSellingSection({ products }: BestSellingSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Best Selling
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-gray-500">
          Produk-produk yang paling banyak dicari pelanggan kami
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id_product} product={product} featured />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#produk-kami"
            className="inline-flex items-center rounded-full border-2 border-blue-600 px-8 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            LIHAT SEMUA
          </a>
        </div>
      </div>
    </section>
  );
}
