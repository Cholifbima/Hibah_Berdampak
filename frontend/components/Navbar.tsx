"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, LogOut, UserCircle, Package, Search } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { fetchProducts, type Product } from "@/lib/api";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/toko", label: "Toko" },
  { href: "/konsultan", label: "Konsultan AI" },
  { href: "/#kontak", label: "Kontak" },
];

interface NavbarProps {
  transparentOnTop?: boolean;
}

export default function Navbar({ transparentOnTop = false }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Load products once for search autocomplete
  useEffect(() => {
    let active = true;
    fetchProducts().then((products) => {
      if (active) setAllProducts(products);
    }).catch(console.error);
    
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!transparentOnTop) {
        setScrolled(window.scrollY > 12);
        return;
      }
      
      const heroSection = document.getElementById('hero-section');
      const navElement = document.querySelector('nav');
      const navHeight = navElement ? navElement.offsetHeight : 80;

      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setScrolled(rect.bottom <= navHeight);
      } else {
        setScrolled(window.scrollY > 500);
      }
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparentOnTop]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/toko?q=${encodeURIComponent(searchQuery)}`);
      setOpen(false);
      setIsSearchFocused(false);
    }
  };

  const isTransparent = transparentOnTop && !scrolled;

  // Search Results Logic
  const searchResults = searchQuery.trim() 
    ? allProducts.filter(p => 
        p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) && p.nama_produk.trim() !== ""
      ).slice(0, 5) 
    : [];

  // Dynamic Styles
  const logoTextClass = isTransparent ? "text-white drop-shadow-md" : "text-[#163f73]";
  const iconBaseClass = isTransparent ? "text-white hover:text-white hover:bg-white/10" : "text-[#163f73] hover:text-[#0066ff] hover:bg-blue-50";
  const loginClass = isTransparent ? "border border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm shadow-lg" : "bg-[#163f73] text-white hover:bg-[#0066ff] hover:shadow-md hover:-translate-y-0.5 border border-transparent";
  const searchInputBg = isTransparent ? "bg-black/20 border-white/20 text-white placeholder:text-white/70 focus:bg-black/40 focus:border-white/50 backdrop-blur-sm shadow-inner" : "bg-gray-50/50 border-gray-200 text-[#163f73] focus:bg-white focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff]";
  const searchIconClass = isTransparent ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-[#0066ff]";

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-[9999] pointer-events-auto transition-all duration-300 ${
      scrolled ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)]" : isTransparent ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent" : "bg-white border-b border-gray-100"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
              alt="TopAssist Logo"
              width={48}
              height={48}
              className={`h-10 w-10 rounded-full object-contain p-0.5 sm:h-12 sm:w-12 transition-all ${isTransparent ? 'ring-2 ring-white/30 shadow-lg' : 'ring-2 ring-gray-100'}`}
            />
            <span className={`text-xl font-extrabold tracking-tight transition-colors duration-300 sm:text-2xl ${logoTextClass}`}>
              TopAssist
            </span>
          </Link>

          {/* Center: Navigation Links & Search */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center ml-8">
            <div className="flex items-center gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                
                let linkClass = "";
                if (isTransparent) {
                  linkClass = isActive ? "text-white drop-shadow-md" : "text-white/80 hover:text-white drop-shadow-sm";
                } else {
                  linkClass = isActive ? "text-[#0066ff]" : "text-[#163f73] hover:text-[#0066ff]";
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[15px] font-bold transition-all duration-200 ${linkClass}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Search Bar & Autocomplete */}
            <div className="relative w-64 xl:w-72">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className={`w-full rounded-full border py-2.5 pl-5 pr-12 text-sm outline-none transition-all ${searchInputBg}`}
                />
                <button 
                  type="submit"
                  className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 transition-colors ${searchIconClass}`}
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Autocomplete Dropdown (Desktop) */}
              {isSearchFocused && searchQuery.trim() && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-[110%] rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden z-[10003] animate-in fade-in slide-in-from-top-2 duration-200">
                  <ul className="max-h-[300px] overflow-y-auto py-2">
                    {searchResults.map((product) => (
                      <li key={product.id_product}>
                        <Link 
                          href={`/toko/detail?id=${product.id_product}`}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors"
                        >
                          {product.gambar_url ? (
                            <img src={product.gambar_url} alt={product.nama_produk} className="h-10 w-10 object-cover rounded-md flex-shrink-0 bg-gray-100" />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded-md flex-shrink-0" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-[#163f73] truncate">{product.nama_produk}</span>
                            <span className="text-xs font-semibold text-[#0066ff]">Rp {product.harga_satuan.toLocaleString("id-ID")}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/toko?q=${encodeURIComponent(searchQuery)}`} className="block w-full bg-gray-50 px-4 py-2.5 text-center text-xs font-bold text-[#163f73] hover:text-[#0066ff] hover:bg-gray-100 border-t border-gray-100 transition-colors">
                    Lihat semua hasil pencarian
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/keranjang" className={`relative p-2 rounded-full transition-all ${iconBaseClass}`}>
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-[1.5px] ring-white">
                  {totalItems > 99 ? "99" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                {user.role === "ADMIN" && (
                  <Link href="/admin" className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${isTransparent ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 border border-amber-300/30' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}>
                    Admin
                  </Link>
                )}
                <Link href="/pesanan" className={`rounded-full p-2 transition-all ${iconBaseClass} flex items-center justify-center`} title="Pesanan Saya">
                  <Image src="/assets/icons/IkonHibah/pesanan.png" alt="Pesanan" width={22} height={22} className={`object-contain transition-all ${isTransparent ? 'brightness-0 invert' : ''}`} />
                </Link>
                <Link href="/profil" className={`flex items-center gap-2 rounded-full p-1 pr-3 transition-all border ${isTransparent ? 'hover:bg-white/10 border-transparent' : 'hover:bg-gray-50 border-transparent hover:border-gray-100'}`} title="Edit Profil">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.nama_lengkap} 
                      className={`h-8 w-8 rounded-full object-cover ring-1 ${isTransparent ? 'ring-white/30' : 'ring-gray-200'}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`avatar-fallback ${user.avatar_url ? 'hidden' : `flex h-8 w-8 items-center justify-center rounded-full ${isTransparent ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0066ff]'}`}`}>
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <span className={`max-w-[100px] truncate text-sm font-bold ${isTransparent ? 'text-white' : 'text-[#163f73]'}`}>{user.nama_lengkap.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className={`rounded-full p-2 transition-all ${isTransparent ? 'text-white hover:text-red-400 hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:inline-flex items-center rounded-full px-6 py-2.5 text-sm font-bold transition-all ${loginClass}`}
              >
                Masuk
              </Link>
            )}

            <button
              type="button"
              className={`relative z-[10000] flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-1.5 touch-manipulation lg:hidden transition-colors ${iconBaseClass}`}
              onClick={() => setOpen(!open)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* ── Mobile drawer ── */}
    {open && (
      <>
        {/* Overlay gelap full-screen */}
        <div
          className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />

        {/* Sidebar Panel */}
        <div className="fixed inset-y-0 right-0 z-[10002] w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col">
          <div className="flex h-16 sm:h-20 items-center justify-between px-5 border-b border-gray-100">
            <span className="text-lg font-bold text-[#163f73]">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-[#163f73] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 mb-6">
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm outline-none focus:border-[#0066ff] focus:bg-white text-[#163f73]"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400">
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {/* Autocomplete Dropdown (Mobile) */}
                {isSearchFocused && searchQuery.trim() && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-[110%] rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden z-[10003] animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="max-h-[250px] overflow-y-auto py-2">
                      {searchResults.map((product) => (
                        <li key={product.id_product}>
                          <Link 
                            href={`/toko/detail?id=${product.id_product}`}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors"
                          >
                            {product.gambar_url ? (
                              <img src={product.gambar_url} alt={product.nama_produk} className="h-8 w-8 object-cover rounded-md flex-shrink-0 bg-gray-100" />
                            ) : (
                              <div className="h-8 w-8 bg-gray-100 rounded-md flex-shrink-0" />
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-[#163f73] truncate">{product.nama_produk}</span>
                              <span className="text-[10px] font-semibold text-[#0066ff]">Rp {product.harga_satuan.toLocaleString("id-ID")}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/toko?q=${encodeURIComponent(searchQuery)}`} className="block w-full bg-gray-50 px-4 py-2 text-center text-xs font-bold text-[#163f73] hover:text-[#0066ff] hover:bg-gray-100 border-t border-gray-100 transition-colors">
                      Lihat semua hasil
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <ul className="space-y-1 px-3">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-base font-bold transition-colors ${
                        isActive ? "bg-blue-50 text-[#0066ff]" : "text-[#163f73] hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* User Section (Mobile) */}
          <div className="border-t border-gray-100 p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0066ff]">
                      <UserCircle className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold text-[#163f73] text-sm">{user.nama_lengkap}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </div>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="flex w-full items-center justify-center rounded-xl bg-amber-50 py-2.5 text-sm font-bold text-amber-600 transition-colors hover:bg-amber-100">
                    Panel Admin
                  </Link>
                )}
                <Link href="/pesanan" onClick={() => setOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-[#0066ff] transition-colors hover:bg-blue-100">
                  <Image src="/assets/icons/IkonHibah/pesanan.png" alt="Pesanan" width={18} height={18} className="object-contain" /> Pesanan Saya
                </Link>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            ) : (
               <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-[#163f73] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0066ff]"
              >
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </>
    )}
    </>
  );
}
