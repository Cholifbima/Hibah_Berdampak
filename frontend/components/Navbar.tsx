"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ShoppingBag, LogOut, UserCircle, Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/", label: "BERANDA" },
  { href: "/toko", label: "TOKO" },
  { href: "/konsultan", label: "KONSULTAN AI" },
  { href: "/kontak", label: "KONTAK" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/icons/IkonHibah/logo_bg_white-small.png"
              alt="TopAssist Logo"
              width={48}
              height={48}
              className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
            />
            <span className="text-xl font-extrabold text-white drop-shadow-md sm:text-2xl">
              TopAssist
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-extrabold uppercase text-white hover:text-white/80 transition-colors xl:text-base"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/keranjang" className="relative text-white hover:text-white/80 transition-colors">
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {totalItems > 99 ? "99" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/pesanan" className="rounded-xl p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors" title="Pesanan Saya">
                  <Package className="h-5 w-5" />
                </Link>
                <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                  <UserCircle className="h-5 w-5" />
                  <span className="max-w-[100px] truncate">{user.nama_lengkap.split(" ")[0]}</span>
                </span>
                <button
                  onClick={logout}
                  className="rounded-xl p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center rounded-2xl border-2 border-white px-6 py-2 text-sm font-light uppercase text-white hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
            )}

            <button
              className="lg:hidden rounded-lg p-1.5 text-white hover:bg-white/10"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#1a4b9e]/95 backdrop-blur-md border-t border-white/10 px-4 pb-5 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3 text-sm font-bold uppercase text-white hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/pesanan"
                className="block rounded-xl px-4 py-3 text-sm font-bold uppercase text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Pesanan Saya
              </Link>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white px-6 py-2.5 text-sm font-light uppercase text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Logout ({user.nama_lengkap.split(" ")[0]})
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="mt-3 flex items-center justify-center rounded-2xl border-2 border-white px-6 py-2.5 text-sm font-light uppercase text-white hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
