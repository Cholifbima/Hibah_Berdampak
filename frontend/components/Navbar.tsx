"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ShoppingBag, LogOut, UserCircle, Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/", label: "BERANDA" },
  { href: "/toko", label: "TOKO" },
  { href: "/konsultan", label: "KONSULTAN AI" },
  { href: "/#kontak", label: "KONTAK" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-[9999] pointer-events-auto border-b border-white/10 bg-[#163f73] transition-shadow duration-300 ${scrolled ? "shadow-[0_6px_32px_rgba(0,0,0,0.28)]" : "shadow-[0_2px_12px_rgba(0,0,0,0.12)]"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
              alt="TopAssist Logo"
              width={48}
              height={48}
              className="h-10 w-10 rounded-full object-contain p-0.5 ring-2 ring-white/35 ring-offset-2 ring-offset-[#163f73]/80 sm:h-12 sm:w-12"
            />
            <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-2xl">
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
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-300 hover:bg-white/10 transition-colors border border-amber-300/40" title="Admin Panel">
                    Admin
                  </Link>
                )}
                <Link href="/pesanan" className="rounded-xl p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors" title="Pesanan Saya">
                  <Package className="h-5 w-5" />
                </Link>
                <Link href="/profil" className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors" title="Edit Profil">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.nama_lengkap} 
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-white/30"
                    />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                  <span className="max-w-[100px] truncate">{user.nama_lengkap.split(" ")[0]}</span>
                </Link>
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
              type="button"
              aria-expanded={open}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              className="relative z-[10000] flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-1.5 text-white hover:bg-white/10 touch-manipulation lg:hidden"
              onClick={() => setOpen(!open)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

    </nav>

      {/* ── Mobile drawer — LUAR nav supaya fixed positioning tidak konflik ── */}
      {open && (
        <>
          {/* Overlay gelap full-screen */}
          <div
            className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="fixed right-0 top-0 z-[10002] flex h-screen w-[280px] flex-col bg-[#163f73] shadow-2xl lg:hidden">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
                  alt="TopAssist"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-contain p-0.5 ring-2 ring-white/30"
                />
                <span className="text-[15px] font-extrabold text-white">TopAssist</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-amber-300 hover:bg-white/10 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              {user && (
                <>
                  <Link
                    href="/profil"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-white/10 transition-colors"
                  >
                    <UserCircle className="h-4 w-4" />
                    Edit Profil
                  </Link>
                  <Link
                    href="/pesanan"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-white/10 transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    Pesanan Saya
                  </Link>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4">
              {user ? (
                <>
                  <div className="mb-3 flex items-center gap-2.5 px-2">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.nama_lengkap} 
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
                      />
                    ) : (
                      <UserCircle className="h-8 w-8 shrink-0 text-white/60" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-white">{user.nama_lengkap}</p>
                      <p className="text-[11px] text-white/50">{user.role === "ADMIN" ? "Administrator" : "Pelanggan"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-xl border-2 border-white px-6 py-2.5 text-[13px] font-bold uppercase text-white hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
