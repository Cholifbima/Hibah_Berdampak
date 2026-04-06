import type { NextConfig } from "next";

/** Proxy ke Express agar fetch('/api/...') dari browser (termasuk lewat tunnel) menuju backend lokal tanpa NEXT_PUBLIC_API_URL salah ke URL frontend. */
const backendOrigin = process.env.BACKEND_URL || "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  /**
   * Mode dev: Next memblokir origin selain localhost untuk aset `/_next/*`.
   * Tanpa ini, HP lewat tunnel tidak memuat chunk JS → React tidak hidrat → tombol/menu mati.
   * Bukan karena tunnel "statis"; Quick Tunnel meneruskan ke `next dev` seperti biasa.
   */
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.trycloudflare.dev",
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.loca.lt",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
