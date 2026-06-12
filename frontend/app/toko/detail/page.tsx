import { Metadata } from "next";
import DetailClient from "./DetailClient";
import { fetchProductById } from "@/lib/api";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const idStr = typeof searchParams.id === "string" ? searchParams.id : Array.isArray(searchParams.id) ? searchParams.id[0] : null;
  const id = idStr ? parseInt(idStr, 10) : NaN;

  if (isNaN(id)) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  try {
    const product = await fetchProductById(id);
    const images = product.gambar_url ? [product.gambar_url] : [];

    return {
      title: `${product.nama_produk}`,
      description: product.deskripsi.slice(0, 160),
      openGraph: {
        title: `${product.nama_produk} | TopKonveksi`,
        description: product.deskripsi.slice(0, 160),
        images: images,
        type: "website",
        url: `https://topkonveksi.com/toko/detail?id=${id}`,
      },
      twitter: {
        card: "summary_large_image",
        title: product.nama_produk,
        description: product.deskripsi.slice(0, 160),
        images: images,
      },
      alternates: {
        canonical: `https://topkonveksi.com/toko/detail?id=${id}`,
      }
    };
  } catch (error) {
    return {
      title: "Detail Produk",
    };
  }
}

export default async function ProductDetailPage({ searchParams }: Props) {
  const idStr = typeof searchParams.id === "string" ? searchParams.id : Array.isArray(searchParams.id) ? searchParams.id[0] : null;
  const id = idStr ? parseInt(idStr, 10) : NaN;

  let product = null;
  if (!isNaN(id)) {
    try {
      product = await fetchProductById(id);
    } catch (e) {
      // Ignored
    }
  }

  let jsonLd = null;
  if (product) {
    jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.nama_produk,
      "image": product.gambar_url ? [product.gambar_url] : [],
      "description": product.deskripsi,
      "sku": `PRD-${product.id_product}`,
      "brand": {
        "@type": "Brand",
        "name": "TopKonveksi"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://topkonveksi.com/toko/detail?id=${product.id_product}`,
        "priceCurrency": "IDR",
        "price": product.harga_satuan,
        "availability": product.stok > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DetailClient />
    </>
  );
}
