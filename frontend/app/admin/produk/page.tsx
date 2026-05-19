"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, formatRupiah } from "@/lib/api";
import {
  Menu, X, LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  ShoppingBag, Search, Plus, Pencil, Trash2, Loader2,
  ChevronDown, ChevronUp, Save, AlertTriangle, ImagePlus, ImageOff,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Product {
  id_product: number;
  nama_produk: string;
  deskripsi: string;
  harga_satuan: number;
  stok: number;
  gambar_url: string | null;
  kategori: string;
  link_shopee: string | null;
  link_tokopedia: string | null;
  link_lazada: string | null;
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

// ─── Product Form Modal ──────────────────────────────────────────────────────
function ProductModal({
  product, token, onClose, onSave, allCategories,
}: {
  product: Product | null; token: string; onClose: () => void; onSave: (p: Product) => void; allCategories: string[];
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    nama_produk: product?.nama_produk ?? "",
    deskripsi: product?.deskripsi ?? "",
    harga_satuan: product ? String(product.harga_satuan) : "",
    stok: product ? String(product.stok) : "",
    kategori: product?.kategori ?? "",
    link_shopee: product?.link_shopee ?? "",
    link_tokopedia: product?.link_tokopedia ?? "",
    link_lazada: product?.link_lazada ?? "",
  });
  // gambar state terpisah
  const [gambarUrl, setGambarUrl] = useState<string>(product?.gambar_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.gambar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [kategoriMode, setKategoriMode] = useState<"select" | "custom">(product?.kategori && !allCategories.includes(product.kategori) ? "custom" : "select");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setGambarUrl(""); // reset URL lama, akan diupload saat submit
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview("");
    setGambarUrl("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!token) { setErr("Silakan login ulang sebagai admin"); return; }
    setSaving(true);
    try {
      let finalGambarUrl: string | null = gambarUrl || null;

      // Upload file jika ada file baru dipilih
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const upRes = await fetch(apiUrl("/upload-image"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        setUploading(false);
        if (!upRes.ok) {
          const d = await upRes.json();
          setErr(d.error || "Gagal upload gambar");
          setSaving(false);
          return;
        }
        const { url } = await upRes.json();
        finalGambarUrl = url;
      }

      const body = {
        nama_produk: form.nama_produk.trim(),
        deskripsi: form.deskripsi.trim(),
        harga_satuan: Number(form.harga_satuan),
        stok: Number(form.stok),
        gambar_url: finalGambarUrl,
        kategori: form.kategori.trim(),
        link_shopee: form.link_shopee.trim() || null,
        link_tokopedia: form.link_tokopedia.trim() || null,
        link_lazada: form.link_lazada.trim() || null,
      };
      const url = isEdit ? apiUrl(`/products/${product!.id_product}`) : apiUrl("/products");
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let errMsg = "Gagal menyimpan";
        try { const d = await res.json(); errMsg = d.error || errMsg; } catch { errMsg = `Server error (${res.status})`; }
        setErr(errMsg); setSaving(false); return;
      }
      const saved = await res.json();
      onSave(saved);
    } catch { setErr("Terjadi kesalahan"); }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-14 items-center justify-between px-5" style={{ background: "linear-gradient(135deg, rgb(22,63,115) 0%, rgb(31,103,223) 100%)" }}>
          <h2 className="text-[15px] font-bold text-white">{isEdit ? "Edit Produk" : "Tambah Produk"}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-5 py-4 space-y-3">
          {err && <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-700"><AlertTriangle className="h-4 w-4 shrink-0" />{err}</div>}

          {/* ── Gambar Upload ── */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-gray-600">Gambar Produk</label>
            {imagePreview ? (
              <div className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="preview" className="h-full w-full object-contain p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-gray-700">
                    {imageFile ? imageFile.name : "Gambar saat ini"}
                  </p>
                  {imageFile && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {(imageFile.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                  <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#163f73]/30 bg-[#163f73]/8 px-2.5 py-1 text-[11px] font-semibold text-[#163f73] hover:bg-[#163f73]/15 transition-colors">
                    <ImagePlus className="h-3 w-3" />Ganti Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 hover:border-[#163f73]/40 hover:bg-[#163f73]/5 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#163f73]/8">
                  <ImagePlus className="h-6 w-6 text-[#163f73]/60" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-gray-700">Pilih gambar dari perangkat</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP — max 5 MB</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
            {!imagePreview && (
              <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                <ImageOff className="h-3 w-3" />Tanpa gambar produk akan tampil placeholder
              </p>
            )}
          </div>

          {[
            { key: "nama_produk", label: "Nama Produk", placeholder: "Contoh: Tas Ransel A3", required: true },
            { key: "harga_satuan", label: "Harga (Rp)", placeholder: "50000", type: "number", required: true },
            { key: "stok", label: "Stok", placeholder: "10", type: "number", required: true },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-[12px] font-semibold text-gray-600">{f.label}{f.required && " *"}</label>
              <input
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                required={f.required}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                min={f.type === "number" ? "0" : undefined}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-gray-600">Kategori</label>
            {kategoriMode === "select" ? (
              <>
                <select
                  value={form.kategori}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setKategoriMode("custom");
                      setForm((p) => ({ ...p, kategori: "" }));
                    } else {
                      setForm((p) => ({ ...p, kategori: e.target.value }));
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:border-[#163f73] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
                >
                  <option value="">— Pilih Kategori —</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">+ Tambah Kategori Baru</option>
                </select>
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tulis kategori baru…"
                  value={form.kategori}
                  onChange={(e) => setForm((p) => ({ ...p, kategori: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
                />
                {allCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setKategoriMode("select"); setForm((p) => ({ ...p, kategori: "" })); }}
                    className="shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Pilih
                  </button>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-gray-600">Link Shopee</label>
            <input
              type="url"
              placeholder="https://id.shp.ee/..."
              value={form.link_shopee}
              onChange={(e) => setForm((p) => ({ ...p, link_shopee: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#EE4D2D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EE4D2D]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-gray-600">Deskripsi</label>
            <textarea
              rows={7} placeholder="Deskripsi produk…"
              value={form.deskripsi}
              onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163f73]/20 resize-y min-h-[120px]"
            />
          </div>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#163f73] py-3 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors disabled:opacity-60"
          >
            {(saving || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {uploading ? "Mengupload gambar…" : saving ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ──────────────────────────────────────────────────────────
function DeleteConfirm({ product, token, onClose, onDelete }: { product: Product; token: string; onClose: () => void; onDelete: (id: number) => void }) {
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(apiUrl(`/products/${product.id_product}`), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      onDelete(product.id_product);
    } catch { setLoading(false); }
  }
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-red-100"><Trash2 className="h-6 w-6 text-red-500" /></div>
        <h3 className="mt-3 text-[16px] font-bold text-gray-900">Hapus Produk?</h3>
        <p className="mt-1 text-sm text-gray-500">"{product.nama_produk}" akan dihapus permanen.</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
          <button type="button" disabled={loading} onClick={handleDelete} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({
  product, onEdit, onDelete,
}: {
  product: Product; onEdit: (p: Product) => void; onDelete: (p: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#e9f4ff]">
          {product.gambar_url
            ? <Image src={product.gambar_url} alt={product.nama_produk} fill sizes="56px" className="object-contain p-1" />
            : <div className="flex h-full items-center justify-center text-2xl">📦</div>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-gray-900">{product.nama_produk}</p>
          <p className="text-[12px] text-[#163f73] font-semibold">{formatRupiah(product.harga_satuan)}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[11px] font-semibold ${product.stok > 5 ? "text-green-600" : product.stok > 0 ? "text-amber-600" : "text-red-600"}`}>
              {product.stok > 0 ? `Stok: ${product.stok}` : "Habis"}
            </span>
            {product.kategori && <span className="rounded-full bg-[#163f73]/8 px-2 py-0.5 text-[10px] font-medium text-[#163f73]/80">{product.kategori}</span>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" onClick={() => onEdit(product)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => onDelete(product)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
        <button type="button" onClick={() => setOpen((p) => !p)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {open && product.deskripsi && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[12px] text-gray-600 leading-relaxed">{product.deskripsi}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminProdukPage() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [sortBy, setSortBy] = useState<"nama" | "harga" | "stok">("nama");
  const [modal, setModal] = useState<"add" | Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/products"));
      if (res.ok) setProducts(await res.json());
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleSave(saved: Product) {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id_product === saved.id_product);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
    setModal(null);
  }

  function handleDelete(id: number) {
    setProducts((prev) => prev.filter((p) => p.id_product !== id));
    setDeleteTarget(null);
  }

  // Normalisasi kategori: trim + collapse whitespace
  function normalizeKat(k: string | null): string {
    return (k || "Lainnya").trim().replace(/\s+/g, " ");
  }

  // Semua kategori unik (case-sensitive setelah normalisasi), sorted A-Z
  const categories = ["Semua", ...Array.from(new Set(products.map((p) => normalizeKat(p.kategori)))).sort()];

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.nama_produk.toLowerCase().includes(q) || p.kategori?.toLowerCase().includes(q);
      const matchKat = activeKategori === "Semua" || normalizeKat(p.kategori) === activeKategori;
      return matchSearch && matchKat;
    })
    .sort((a, b) => {
      if (sortBy === "harga") return a.harga_satuan - b.harga_satuan;
      if (sortBy === "stok") return b.stok - a.stok;
      return a.nama_produk.localeCompare(b.nama_produk, "id");
    });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <AdminHeader title="Produk" onMenuToggle={() => setMenuOpen(true)} />
      <SidebarMenu open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />

      {modal !== null && (
        <ProductModal
          product={modal === "add" ? null : (modal as Product)}
          token={token!}
          onClose={() => setModal(null)}
          onSave={handleSave}
          allCategories={Array.from(new Set(products.map((p) => p.kategori).filter(Boolean))).sort()}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm product={deleteTarget} token={token!} onClose={() => setDeleteTarget(null)} onDelete={handleDelete} />
      )}

      <main className="pt-[68px]">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-5">

          {/* ── Search + Tambah ── */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveKategori("Semua"); }}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setModal("add")}
              className="flex items-center gap-1.5 rounded-xl bg-[#163f73] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#0f2d55] transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />Tambah
            </button>
          </div>

          {/* ── Category chips (horizontal scroll) ── */}
          {!loading && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((kat) => {
                const count = kat === "Semua" ? products.length : products.filter((p) => normalizeKat(p.kategori) === kat).length;
                const active = activeKategori === kat;
                return (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => setActiveKategori(kat)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                      active
                        ? "border-[#163f73] bg-[#163f73] text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#163f73]/40 hover:text-[#163f73]"
                    }`}
                  >
                    {kat}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Sort + count ── */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-gray-500">
              {filtered.length} produk
              {activeKategori !== "Semua" && <span className="ml-1 font-semibold text-[#163f73]">· {activeKategori}</span>}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-600 focus:border-[#163f73] focus:outline-none"
            >
              <option value="nama">Urut: Nama A–Z</option>
              <option value="harga">Urut: Harga ↑</option>
              <option value="stok">Urut: Stok ↓</option>
            </select>
          </div>

          {/* ── List produk ── */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-10 w-10 animate-spin text-[#163f73]" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-white px-4 py-12 text-center shadow-sm">
              <Package className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-500">
                {search ? "Produk tidak ditemukan" : activeKategori !== "Semua" ? `Tidak ada produk di kategori ini` : "Belum ada produk"}
              </p>
              {!search && activeKategori === "Semua" && (
                <button type="button" onClick={() => setModal("add")} className="mt-3 text-[13px] font-semibold text-[#163f73] underline">Tambah produk pertama</button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <ProductCard key={p.id_product} product={p} onEdit={(p) => setModal(p)} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
