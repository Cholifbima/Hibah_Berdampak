"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCart, getEffectivePrice } from "@/lib/cart-context";
import { formatRupiah, apiUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const WA_NUMBER = "628157799036";
const ORDER_COUNTER_KEY = "topassist_order_counter";

function getNextOrderNumber(): string {
  const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "0", 10);
  const next = current + 1;
  localStorage.setItem(ORDER_COUNTER_KEY, String(next));
  return `#${String(next).padStart(4, "0")}`;
}

/* Reusable input field component matching Figma style */
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-[#373737]">
        {label}
        {required && <span className="ml-0.5 text-[#a01720]"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-[10px] border border-black/20 bg-white/60 px-3 py-2.5 text-[13px] text-gray-800 placeholder:text-[#a4a3a7] placeholder:text-[11px] focus:border-[#163f73] focus:bg-white focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none transition-colors backdrop-blur-sm";

export default function OrderForm() {
  const { items, clearCart, cartLoading } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [nama, setNama] = useState(user?.nama_lengkap ?? "");
  const [telepon, setTelepon] = useState(user?.no_whatsapp ?? "");
  const [country, setCountry] = useState("Indonesia");
  const [alamat, setAlamat] = useState("");
  const [detailAlamat, setDetailAlamat] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [catatan, setCatatan] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const previewOrderNumber = useMemo(() => {
    if (typeof window === "undefined") return "#0001";
    const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "0", 10);
    return `#${String(current + 1).padStart(4, "0")}`;
  }, []);

  // Load user address from profile on mount
  useEffect(() => {
    if (user) {
      if (user.nama_lengkap) setNama(user.nama_lengkap);
      if (user.no_whatsapp) setTelepon(user.no_whatsapp);
      if (user.alamat) {
        setAlamat(user.alamat);
        // Try to extract province from alamat (format: street, city, province, country)
        const parts = user.alamat.split(",").map(p => p.trim());
        if (parts.length >= 3) {
          setProvinsi(parts[parts.length - 2]);
        }
      }
      if (user.lat) setLat(user.lat);
      if (user.lng) setLng(user.lng);
    }
  }, [user]);

  // Detect current location
  function detectLocation() {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung GPS");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        // Reverse geocode to get address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              const address = data.display_name;
              setAlamat(address);
              const parts = address.split(",").map((p: string) => p.trim());
              if (parts.length >= 3) {
                setProvinsi(parts[parts.length - 2]);
              }
            }
          })
          .catch(() => {})
          .finally(() => setDetectingLocation(false));
      },
      (error) => {
        setDetectingLocation(false);
        alert("Gagal mendeteksi lokasi: " + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Save address to profile
  async function saveAddressToProfile() {
    if (!user || !token) return;
    const fullAlamat = [alamat, detailAlamat, provinsi, country].filter(Boolean).join(", ");
    try {
      await fetch(apiUrl("/users/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          alamat: fullAlamat,
          lat,
          lng,
        }),
      });
    } catch {
      // Silent fail - address will still be used for this order
    }
  }

  /* --- guards --- */
  if (authLoading || (user && cartLoading)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#163f73]" />
        <p className="mt-3 text-sm text-white/80">Memuat keranjang…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#163f73]/10 text-3xl">
          🛍️
        </div>
        <h2 className="text-lg font-bold text-[#163f73]">Keranjang Kosong</h2>
        <p className="mt-2 text-sm text-gray-500">
          Tambah produk ke keranjang terlebih dahulu.
        </p>
        <Link
          href="/toko"
          className="mt-6 inline-flex items-center rounded-full bg-[#163f73] px-8 py-3 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors"
        >
          Lihat Produk
        </Link>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-lg font-bold text-[#163f73]">Login dulu</h2>
        <p className="mt-2 text-sm text-gray-600">
          Login untuk mengisi form pemesanan dan menyimpan riwayat pesanan ke akun Anda.
        </p>
        <Link
          href="/login?redirect=/pemesanan"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#163f73] py-3.5 text-sm font-bold text-white hover:bg-[#0f2d55] transition-colors"
        >
          Login untuk lanjut
        </Link>
        <Link
          href="/keranjang"
          className="mt-3 block text-center text-sm font-semibold text-[#163f73] hover:underline"
        >
          Kembali ke keranjang
        </Link>
      </div>
    );
  }

  const totalAfterDiscount = items.reduce(
    (sum, item) => sum + getEffectivePrice(item) * item.qty,
    0
  );

  function buildMessage(orderNum: string): string {
    const sep = "--------------------------------";
    const fullAlamat = [alamat, detailAlamat, provinsi, country]
      .filter(Boolean)
      .join(", ");

    const lines: string[] = [];
    lines.push(`*PESANAN BARU - TopAssist*`);
    lines.push(`*No. Order: ${orderNum}*`);
    lines.push(sep);
    lines.push("");
    lines.push(`*Nama:* ${nama}`);
    lines.push(`*Telepon:* ${telepon}`);
    lines.push(`*Alamat:* ${fullAlamat}`);
    if (catatan.trim()) lines.push(`*Catatan:* ${catatan}`);
    lines.push("");
    lines.push(sep);
    lines.push("*Detail Pesanan:*");
    lines.push("");

    items.forEach((item, idx) => {
      const unitPrice = getEffectivePrice(item);
      const isDiscounted = unitPrice < item.harga_satuan;
      lines.push(`${idx + 1}. *${item.nama_produk}*`);
      lines.push(`   ${item.qty} pcs x ${formatRupiah(unitPrice)}`);
      if (isDiscounted) {
        const matched = item.discounts
          .filter((d) => item.qty >= d.min_qty)
          .sort((a, b) => b.min_qty - a.min_qty)[0];
        lines.push(`   [Grosir] min ${matched.min_qty} pcs`);
      }
      lines.push(`   Subtotal: ${formatRupiah(unitPrice * item.qty)}`);
      lines.push("");
    });

    lines.push(sep);
    lines.push(`*TOTAL: ${formatRupiah(totalAfterDiscount)}*`);
    lines.push("");
    lines.push("Mohon konfirmasi pesanan ini. Terima kasih!");

    return lines.join("\n");
  }

  const isValid =
    nama.trim() && telepon.trim() && alamat.trim() && provinsi.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !user || !token) return;

    const orderNum = getNextOrderNumber();
    const fullAlamat = [alamat, detailAlamat, provinsi, country]
      .filter(Boolean)
      .join(", ");

    try {
      await fetch(apiUrl("/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kode_pesanan: orderNum,
          nama_penerima: nama,
          alamat_pengiriman: fullAlamat,
          no_telepon: telepon,
          catatan,
          lat,
          lng,
          items: items.map((item) => ({
            id_product: item.id_product,
            kuantitas: item.qty,
            harga_satuan_terekam: getEffectivePrice(item),
            subtotal: getEffectivePrice(item) * item.qty,
          })),
        }),
      });
    } catch {
      /* WA tetap dikirim meski DB gagal */
    }

    // Save address to profile for future orders
    await saveAddressToProfile();

    const msg = encodeURIComponent(buildMessage(orderNum));
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    clearCart();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={handleSubmit}>
        {/* ── Card utama ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">

          {/* Produk dipesan */}
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#163f73]">
              Produk Dipesan
            </p>
            <div className="space-y-3">
              {items.map((item) => {
                const unitPrice = getEffectivePrice(item);
                const isDiscounted = unitPrice < item.harga_satuan;
                return (
                  <div key={item.id_product} className="flex gap-3">
                    <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#c3dcff] to-[#7ab2f4]">
                      {item.gambar_url ? (
                        <Image
                          src={item.gambar_url}
                          alt={item.nama_produk}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">🛍️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#373737] line-clamp-2 leading-snug">
                        {item.nama_produk}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[13px] font-extrabold text-[#163f73]">
                          {formatRupiah(unitPrice)}
                        </span>
                        {isDiscounted && (
                          <>
                            <span className="text-[10px] text-gray-400 line-through">
                              {formatRupiah(item.harga_satuan)}
                            </span>
                            <span className="rounded-[3px] bg-[#c3dcff] px-1 py-px text-[8px] font-extrabold text-[#163f73]">
                              -{Math.round((1 - unitPrice / item.harga_satuan) * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Stok tersedia &bull; Qty: {item.qty}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4 px-5 py-5">
            <FormField label="Nama" required>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama anda"
                className={inputClass}
                required
              />
            </FormField>

            <FormField label="Country/Region" required>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Indonesia"
                className={inputClass}
                required
              />
            </FormField>

            {/* Map Picker untuk Alamat */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-[#373737]">
                  <MapPin className="h-3.5 w-3.5 text-[#163f73]" />
                  Pilih Lokasi Pengiriman
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {detectingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                  {detectingLocation ? "Mendeteksi..." : "Lokasi Saya"}
                </button>
              </div>
              
              <MapPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng, address) => {
                  setLat(newLat);
                  setLng(newLng);
                  if (address) {
                    setAlamat(address);
                    const parts = address.split(",").map(p => p.trim());
                    if (parts.length >= 3) {
                      setProvinsi(parts[parts.length - 2]);
                    }
                  }
                }}
              />
              
              {(lat && lng) && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 border border-emerald-200">
                    <MapPin className="h-2.5 w-2.5" />
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </span>
                </div>
              )}
            </div>

            <FormField label="Alamat Lengkap" required>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Alamat lengkap pengiriman..."
                rows={3}
                className={`${inputClass} resize-none`}
                required
              />
            </FormField>

            <FormField label="Detail Tambahan (No. rumah, RT/RW, dll)">
              <input
                type="text"
                value={detailAlamat}
                onChange={(e) => setDetailAlamat(e.target.value)}
                placeholder="No. rumah, gang, RT/RW..."
                className={inputClass}
              />
            </FormField>

            <FormField label="Provinsi" required>
              <input
                type="text"
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                placeholder="Masukkan provinsi"
                className={inputClass}
                required
              />
            </FormField>

            <FormField label="Nomor Telepon" required>
              <input
                type="tel"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className={inputClass}
                required
              />
            </FormField>
          </div>

          {/* Total */}
          <div className="mx-5 mb-4 rounded-xl border border-gray-100 bg-[#f5f8ff] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#040404]">Total</span>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase text-gray-400">IDR</p>
                <p className="text-[15px] font-extrabold text-[#163f73]">
                  {formatRupiah(totalAfterDiscount)}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan */}
          <div className="px-5 pb-5">
            <FormField label="Catatan Khusus (opsional)">
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Masukkan catatan khusus tentang pesanan anda"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </FormField>
          </div>

          {/* Submit */}
          <div className="px-5 pb-6">
            <button
              type="submit"
              disabled={!isValid}
              className="w-full rounded-full bg-[#163f73] py-3.5 text-[14px] font-semibold text-white shadow-md transition-all hover:bg-[#0f2d55] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Kirim form pemesanan
            </button>
          </div>
        </div>

        {/* Back link & Lazada */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            href="/keranjang"
            className="text-[13px] font-semibold text-white/80 hover:text-white transition-colors"
          >
            ← Kembali ke Keranjang
          </Link>
          <a
            href="https://www.lazada.co.id/shop/topassist"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
            title="Kunjungi kami di Lazada"
          >
            <span className="text-[11px] text-gray-500">Juga tersedia di</span>
            <Image
              src="/assets/icons/IkonHibah/lazada.png"
              alt="Lazada"
              width={60}
              height={20}
              className="h-5 w-auto object-contain"
            />
          </a>
        </div>
      </form>
    </div>
  );
}
