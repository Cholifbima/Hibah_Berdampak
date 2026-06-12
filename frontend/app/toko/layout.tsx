import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description: "Jelajahi berbagai produk konveksi unggulan dari TopKonveksi, mulai dari tas ransel, selempang, hingga produk custom sesuai kebutuhan Anda.",
  openGraph: {
    title: "Katalog Produk | TopKonveksi",
    description: "Jelajahi berbagai produk konveksi unggulan dari TopKonveksi.",
    url: "https://topkonveksi.com/toko",
  },
  alternates: {
    canonical: "https://topkonveksi.com/toko",
  }
};

export default function TokoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
