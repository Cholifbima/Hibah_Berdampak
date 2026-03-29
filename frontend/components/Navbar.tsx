"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "BERANDA" },
  { href: "/toko", label: "TOKO" },
  { href: "/kontak", label: "KONTAK" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <span className="text-lg font-bold text-blue-900">
              Top<span className="text-blue-500">Assist</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <User className="h-4 w-4" />
              LOGIN
            </Link>
            <button
              className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 pb-4 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => setMobileOpen(false)}
          >
            <User className="h-4 w-4" />
            LOGIN
          </Link>
        </div>
      )}
    </nav>
  );
}
