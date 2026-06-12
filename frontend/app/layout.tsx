import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL('https://topkonveksi.com'),
  title: {
    default: "TopKonveksi — Pabrik Konveksi Tas & Produk Custom Berkualitas",
    template: "%s | TopKonveksi"
  },
  description:
    "Pabrik konveksi terpercaya untuk pembuatan tas, baju, seragam, dan produk custom berkualitas dengan harga pabrik. Hubungi TopKonveksi untuk pemesanan grosir & custom.",
  keywords: ["konveksi tas", "pabrik konveksi", "konveksi murah", "custom tas", "konveksi seragam", "grosir tas", "konveksi baju", "TopKonveksi", "TopAssist"],
  authors: [{ name: "TopKonveksi" }],
  creator: "TopKonveksi",
  publisher: "TopKonveksi",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://topkonveksi.com",
    title: "TopKonveksi — Pabrik Konveksi Berkualitas",
    description: "Jasa pembuatan tas dan produk custom berkualitas dengan harga terjangkau. Pesan grosir sekarang!",
    siteName: "TopKonveksi",
    images: [
      {
        url: "/assets/icons/IkonHibah/logo_bg_white_large.jpeg",
        width: 800,
        height: 600,
        alt: "Logo TopKonveksi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TopKonveksi — Pabrik Konveksi Berkualitas",
    description: "Jasa pembuatan tas dan produk custom berkualitas dengan harga terjangkau. Pesan grosir sekarang!",
    images: ["/assets/icons/IkonHibah/logo_bg_white_large.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
