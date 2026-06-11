"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, authFetch } from "@/lib/api";
import {
  Menu, X, LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  ShoppingBag, Search, Loader2, UserCircle2, Shield,
  Phone, Mail, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface User {
  id_user: number;
  nama_lengkap: string;
  username: string;
  email: string;
  no_whatsapp: string | null;
  role: "USER" | "ADMIN";
  created_at?: string;
}

// ─── Shared Admin UI ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/produk", icon: Package, label: "Produk" },
  { href: "/admin/pesanan", icon: ShoppingCart, label: "Pesanan" },
  { href: "/admin/users", icon: Users, label: "Pengguna" },
];

function AdminHeader({ title, onMenuToggle }: { title: string; onMenuToggle: () => void }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-[9999] flex h-[68px] items-center justify-between px-4" style={{ background: "linear-gradient(135deg, rgb(22,63,115) 0%, rgb(31,103,223) 100%)" }}>
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg" alt="TopAssist" width={36} height={36} className="h-9 w-9 rounded-full object-contain p-0.5" />
          <span className="text-[16px] font-extrabold text-white drop-shadow-sm">TopAssist</span>
        </Link>
        <span className="hidden text-white/50 sm:inline">·</span>
        <span className="hidden text-[14px] font-semibold text-white/80 sm:inline">{title}</span>
      </div>
      <button type="button" onClick={onMenuToggle} className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"><Menu className="h-6 w-6" /></button>
    </header>
  );
}

function SidebarMenu({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed right-0 top-0 z-[9998] flex h-full w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[68px] items-center justify-between px-5" style={{ background: "linear-gradient(135deg, rgb(22,63,115) 0%, rgb(31,103,223) 100%)" }}>
          <span className="text-[15px] font-bold text-white">Menu Admin</span>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#163f73]/8 hover:text-[#163f73] transition-colors mb-1">
              <item.icon className="h-5 w-5 text-[#163f73]/70" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors mb-1"><ShoppingBag className="h-5 w-5" />Lihat Toko</Link>
          <button type="button" onClick={() => { onLogout(); onClose(); }} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"><LogOut className="h-5 w-5" />Logout</button>
        </div>
      </aside>
    </>
  );
}

// ─── User Card ───────────────────────────────────────────────────────────────
function UserCard({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";
  const initials = user.nama_lengkap
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Avatar */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${isAdmin ? "bg-[#163f73] text-white" : "bg-[#e9f4ff] text-[#163f73]"}`}>
          {initials || <UserCircle2 className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-gray-900 truncate">{user.nama_lengkap}</span>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#163f73] px-2 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-2.5 w-2.5" />ADMIN
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-gray-500 truncate">@{user.username} · {user.email}</p>
        </div>

        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[12px]">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">Email:</span>
              <a href={`mailto:${user.email}`} className="font-medium text-[#163f73] hover:underline">{user.email}</a>
            </div>
            {user.no_whatsapp && (
              <div className="flex items-center gap-2 text-[12px]">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500">WhatsApp:</span>
                <a href={`https://wa.me/${user.no_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline">{user.no_whatsapp}</a>
              </div>
            )}
            <div className="flex items-center gap-2 text-[12px]">
              <UserCircle2 className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">Username:</span>
              <span className="font-medium text-gray-800">@{user.username}</span>
            </div>
            {user.created_at && (
              <div className="text-[11px] text-gray-400">
                Bergabung: {new Date(user.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"SEMUA" | "USER" | "ADMIN">("SEMUA");

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await authFetch(apiUrl("/admin/users"), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch { /* empty */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "SEMUA" || u.role === filterRole;
    const q = search.toLowerCase();
    const matchSearch = !q || u.nama_lengkap.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = users.filter((u) => u.role === "USER").length;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <AdminHeader title="Pengguna" onMenuToggle={() => setMenuOpen(true)} />
      <SidebarMenu open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />

      <main className="pt-[68px]">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: users.length },
              { label: "Pelanggan", value: userCount },
              { label: "Admin", value: adminCount },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-100 bg-white px-3 py-3 text-center shadow-sm">
                <p className="text-[20px] font-extrabold text-[#163f73]">{s.value}</p>
                <p className="text-[11px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Cari nama, username, email…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#163f73] focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
            >
              <option value="SEMUA">Semua</option>
              <option value="USER">Pelanggan</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <p className="text-[12px] text-gray-500">{filtered.length} pengguna</p>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-10 w-10 animate-spin text-[#163f73]" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-white px-4 py-12 text-center shadow-sm">
              <Users className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-500">Tidak ada pengguna</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => <UserCard key={u.id_user} user={u} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
