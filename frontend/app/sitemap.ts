import { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://topkonveksi.com";

  // Rute Statis
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/toko`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Rute Dinamis (Produk)
  let productsSitemap: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchProducts();
    productsSitemap = products.map((product) => ({
      url: `${baseUrl}/toko/detail?id=${product.id_product}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Gagal mengambil produk untuk sitemap:", error);
  }

  return [...staticRoutes, ...productsSitemap];
}
