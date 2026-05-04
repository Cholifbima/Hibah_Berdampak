import type { NextConfig } from "next";

/**
 * Static export untuk hosting cPanel (upload folder `out` ke public_html).
 * Tidak mendukung rewrites — set NEXT_PUBLIC_API_URL ke URL API production atau ke Express lokal saat dev.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.trycloudflare.dev",
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.loca.lt",
  ],
};

export default nextConfig;
