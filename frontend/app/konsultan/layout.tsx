import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konsultan AI — TopAssist",
  description: "Tanyakan apapun tentang produk TopAssist kepada Konsultan AI kami.",
};

export default function KonsultanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
