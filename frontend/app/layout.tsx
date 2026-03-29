import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Top Production — Konveksi Tas & Produk Custom Berkualitas",
  description:
    "Temukan produk konveksi berkualitas dari Top Production. Tas custom, perlengkapan olahraga, dan banyak lagi dengan harga terjangkau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)]">
        {children}
      </body>
    </html>
  );
}
