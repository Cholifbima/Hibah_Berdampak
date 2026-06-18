"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, formatRupiah, authFetch } from "@/lib/api";
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
  harga_asli: number | null;
  diskon_persen: number | null;
  harga_grosir: number | null;
  min_grosir: number | null;
  rating: number;
  stok: number;
  gambar_url: string | null;
  kategori: string;
  link_shopee: string | null;
  link_tokopedia: string | null;
  link_lazada: string | null;
  link_tiktok: string | null;
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
    harga_asli: product?.harga_asli ? String(product.harga_asli) : "",
    diskon_persen: product?.diskon_persen ? String(product.diskon_persen) : "",
    harga_grosir: product?.harga_grosir ? String(product.harga_grosir) : "",
    min_grosir: product?.min_grosir ? String(product.min_grosir) : "",
    rating: product?.rating ? String(product.rating) : "",
    stok: product ? String(product.stok) : "",
    kategori: product?.kategori ?? "",
    link_shopee: product?.link_shopee ?? "",
    link_tokopedia: product?.link_tokopedia ?? "",
    link_lazada: product?.link_lazada ?? "",
    link_tiktok: product?.link_tiktok ?? "",
  });
  // multi-image state
  const parseInitialUrls = (raw: string | null | undefined): string[] => {
    if (!raw) return [];
    if (raw.startsWith('[')) { try { return JSON.parse(raw); } catch { return [raw]; } }
    return [raw];
  };
  const [imageUrls, setImageUrls] = useState<string[]>(parseInitialUrls(product?.gambar_url));
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [kategoriMode, setKategoriMode] = useState<"select" | "custom">(product?.kategori && !allCategories.includes(product.kategori) ? "custom" : "select");

  const MAX_IMAGES = 8;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - imageUrls.length - imageFiles.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageFiles((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  }

  function handleRemoveExistingUrl(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleRemoveNewFile(idx: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!token) { setErr("Sesi habis, silakan login ulang sebagai admin"); return; }
    setSaving(true);
    try {
      // Upload semua file baru secara berurutan
      const uploadedUrls: string[] = [...imageUrls];
      if (imageFiles.length > 0) {
        setUploading(true);
        for (const { file } of imageFiles) {
          const fd = new FormData();
          fd.append("image", file);
          const upRes = await authFetch(apiUrl("/upload-image"), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
          if (!upRes.ok) {
            const d = await upRes.json();
            setErr(d.error || "Gagal upload gambar");
            setSaving(false);
            setUploading(false);
            return;
          }
          const { url } = await upRes.json();
          uploadedUrls.push(url);
        }
        setUploading(false);
      }
      const finalGambarUrl: string | null =
        uploadedUrls.length === 0 ? null :
        uploadedUrls.length === 1 ? uploadedUrls[0] :
        JSON.stringify(uploadedUrls);

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
        link_tiktok: form.link_tiktok.trim() || null,
      };
      const url = isEdit ? apiUrl(`/products/${product!.id_product}`) : apiUrl("/products");
      const method = isEdit ? "PUT" : "POST";
      const res = await authFetch(url, {
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

          {/* ── Multi Gambar Upload ── */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12px] font-semibold text-gray-600">
                Gambar Produk <span className="font-normal text-gray-400">({imageUrls.length + imageFiles.length}/{MAX_IMAGES})</span>
              </label>
              {imageUrls.length + imageFiles.length > 0 && imageUrls.length + imageFiles.length < MAX_IMAGES && (
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#163f73]/30 bg-[#163f73]/8 px-2.5 py-1 text-[11px] font-semibold text-[#163f73] hover:bg-[#163f73]/15 transition-colors" style={{ background: 'rgba(22,63,115,0.08)' }}>
                  <ImagePlus className="h-3 w-3" />Tambah Foto
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesChange} />
                </label>
              )}
            </div>

            {/* Image grid */}
            {(imageUrls.length + imageFiles.length) > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {/* Existing uploaded URLs */}
                {imageUrls.map((url, idx) => (
                  <div key={`url-${idx}`} className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Foto ${idx + 1}`} className="h-full w-full object-contain p-1" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 rounded-md bg-[#163f73] px-1.5 py-0.5 text-[9px] font-bold text-white">Utama</span>
                    )}
                    <button type="button" onClick={() => handleRemoveExistingUrl(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-500 hover:text-red-500 transition-colors">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                {/* New local files */}
                {imageFiles.map((item, idx) => (
                  <div key={`file-${idx}`} className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-[#163f73]/40 bg-[#163f73]/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt={`Baru ${idx + 1}`} className="h-full w-full object-contain p-1" />
                    <span className="absolute bottom-1 left-1 rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Baru</span>
                    <button type="button" onClick={() => handleRemoveNewFile(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-500 hover:text-red-500 transition-colors">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 hover:border-[#163f73]/40 hover:bg-[#163f73]/5 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#163f73]/8" style={{ background: 'rgba(22,63,115,0.08)' }}>
                  <ImagePlus className="h-6 w-6 text-[#163f73]/60" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-gray-700">Pilih 1–8 gambar produk</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP · Gambar pertama = thumbnail utama</p>
                </div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesChange} />
              </label>
            )}
            {(imageUrls.length + imageFiles.length) === 0 && (
              <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                <ImageOff className="h-3 w-3" />Tanpa gambar produk akan tampil placeholder
              </p>
            )}
          </div>

          {[
            { key: "nama_produk", label: "Nama Produk", placeholder: "Contoh: Tas Ransel A3", required: true },
            { key: "harga_satuan", label: "Harga Diskon/Real (Rp)", placeholder: "50000", type: "number", required: true },
            { key: "harga_asli", label: "Harga Asli (Tipuan/Dicoret)", placeholder: "70000", type: "number", required: false },
            { key: "diskon_persen", label: "Diskon %", placeholder: "29", type: "number", required: false },
            { key: "harga_grosir", label: "Harga Grosir (Rp)", placeholder: "45000", type: "number", required: false },
            { key: "min_grosir", label: "Min. Grosir (pcs)", placeholder: "10", type: "number", required: false },
            { key: "rating", label: "Rating (0-5)", placeholder: "4.8", type: "number", required: false },
            { key: "stok", label: "Stok", placeholder: "10", type: "number", required: true },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-[12px] font-semibold text-gray-600">{f.label}{f.required && " *"}</label>
              <input
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                required={f.required}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((p) => {
                    const next = { ...p, [f.key]: val };
                    
                    // Auto-calculate logic
                    if (f.key === "harga_satuan" || f.key === "harga_asli") {
                      const real = Number(next.harga_satuan);
                      const asli = Number(next.harga_asli);
                      if (asli > 0 && asli > real) {
                        next.diskon_persen = String(Math.round(((asli - real) / asli) * 100));
                      } else {
                        next.diskon_persen = "";
                      }
                    } else if (f.key === "diskon_persen") {
                      const diskon = Number(val);
                      const asli = Number(next.harga_asli);
                      if (asli > 0 && diskon >= 0 && diskon <= 100) {
                        next.harga_satuan = String(Math.round(asli - (asli * diskon / 100)));
                      }
                    }
                    
                    return next;
                  });
                }}
                min={f.type === "number" ? "0" : undefined}
                max={f.key === "rating" ? "5" : f.key === "diskon_persen" ? "100" : undefined}
                step={f.key === "rating" ? "0.1" : f.type === "number" ? "1" : undefined}
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
              placeholder="https://shopee.co.id/..."
              value={form.link_shopee}
              onChange={(e) => setForm((p) => ({ ...p, link_shopee: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#EE4D2D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EE4D2D]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-gray-600">Link Tokopedia</label>
            <input
              type="url"
              placeholder="https://tokopedia.com/..."
              value={form.link_tokopedia}
              onChange={(e) => setForm((p) => ({ ...p, link_tokopedia: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#42b549] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#42b549]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-gray-600">Link Lazada</label>
            <input
              type="url"
              placeholder="https://lazada.co.id/..."
              value={form.link_lazada}
              onChange={(e) => setForm((p) => ({ ...p, link_lazada: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#0f146d] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f146d]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-gray-600">Link TikTok Shop</label>
            <input
              type="url"
              placeholder="https://tiktok.com/..."
              value={form.link_tiktok}
              onChange={(e) => setForm((p) => ({ ...p, link_tiktok: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#000000] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#000000]/20"
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
      await authFetch(apiUrl(`/products/${product.id_product}`), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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

          {/* ── Category Dropdown Filter ── */}
          {!loading && (
            <div className="relative">
              <select
                value={activeKategori}
                onChange={(e) => setActiveKategori(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] font-semibold text-gray-700 shadow-sm focus:border-[#163f73] focus:outline-none focus:ring-1 focus:ring-[#163f73]/20"
              >
                {categories.map((kat) => {
                  const count = kat === "Semua" ? products.length : products.filter((p) => normalizeKat(p.kategori) === kat).length;
                  return (
                    <option key={kat} value={kat}>
                      {kat} ({count})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <Filter className="h-4 w-4" />
              </div>
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
