import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produk Kami — TopAssist Bag Store",
  description:
    "Jelajahi semua produk berkualitas dari Top Production. Tas custom, perlengkapan olahraga, dan banyak lagi.",
};

export default function TokoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
