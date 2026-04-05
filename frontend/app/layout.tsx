import type { Metadata } from "next";
import { Poppins, Roboto_Slab } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "TopAssist — Konveksi Tas & Produk Custom Berkualitas",
  description:
    "Temukan berbagai produk berkualitas untuk keperluan hobi maupun fashion anda. Produk konveksi dari Top Production dengan harga terjangkau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} ${robotoSlab.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-poppins)] antialiased bg-[#f3f9fc]">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
