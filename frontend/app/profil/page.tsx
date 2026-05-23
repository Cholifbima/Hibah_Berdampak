"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/api";
import {
  User, Mail, Phone, Camera, Save, Loader2, AlertTriangle,
  CheckCircle, ArrowLeft, Lock, Eye, EyeOff, MapPin, Navigation,
} from "lucide-react";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function ProfilPage() {
  const { user, token, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ nama_lengkap: "", email: "", no_whatsapp: "", alamat: "", lat: null as number | null, lng: null as number | null });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    // Only redirect if auth is done loading and no token
    if (!token) { 
      router.push("/login?redirect=/profil"); 
      return; 
    }
    if (user) {
      setForm({ 
        nama_lengkap: user.nama_lengkap || "", 
        email: user.email || "", 
        no_whatsapp: user.no_whatsapp || "",
        alamat: user.alamat || "",
        lat: user.lat || null,
        lng: user.lng || null,
      });
      if (user.avatar_url) setAvatarPreview(user.avatar_url);
    }
  }, [user, token, authLoading, router]);

  if (authLoading || !user) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f0f7ff] to-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#163f73]" />
    </div>
  );

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: "error", text: "Ukuran foto maksimal 2MB" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setMsg({ type: "error", text: "Browser tidak mendukung GPS" });
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(p => ({
          ...p,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setDetectingLocation(false);
        setMsg({ type: "success", text: "Lokasi berhasil dideteksi!" });
      },
      (error) => {
        setDetectingLocation(false);
        setMsg({ type: "error", text: "Gagal mendeteksi lokasi: " + error.message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      let avatarUrl = user?.avatar_url || null;
      if (avatarFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", avatarFile);
        const upRes = await fetch(apiUrl("/upload-image"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!upRes.ok) {
          const d = await upRes.json();
          setMsg({ type: "error", text: d.error || "Gagal upload foto" });
          setSaving(false); setUploading(false);
          return;
        }
        avatarUrl = (await upRes.json()).url;
        setUploading(false);
      }
      await updateProfile({
        nama_lengkap: form.nama_lengkap.trim(),
        email: form.email.trim() || null,
        no_whatsapp: form.no_whatsapp.trim(),
        alamat: form.alamat.trim() || null,
        lat: form.lat,
        lng: form.lng,
        avatar_url: avatarUrl,
      });
      setAvatarFile(null);
      setMsg({ type: "success", text: "Profil berhasil diperbarui!" });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Gagal menyimpan" });
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.new !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "Password baru tidak cocok" });
      return;
    }
    if (pwForm.new.length < 6) {
      setPwMsg({ type: "error", text: "Password minimal 6 karakter" });
      return;
    }
    setChangingPw(true);
    try {
      const res = await fetch(apiUrl("/users/me/password"), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setPwMsg({ type: "success", text: "Password berhasil diubah!" });
      setPwForm({ current: "", new: "", confirm: "" });
      setShowPasswordForm(false);
    } catch (err: any) {
      setPwMsg({ type: "error", text: err.message });
    }
    setChangingPw(false);
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#163f73] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#163f73]/10 transition-all";
  const msgClass = (t: string) => `mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${t === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-white to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#163f73] to-[#1f67df] pb-16 pt-20 sm:pt-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link href="/" className="group inline-flex items-center gap-2 text-[13px] font-semibold text-white/80 hover:text-white transition-colors mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">Edit Profil</h1>
          <p className="mt-2 text-base text-white/70">Kelola informasi akun dan keamanan Anda</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-8 pb-20">
        <div className="rounded-2xl bg-white shadow-xl shadow-[#163f73]/5 ring-1 ring-gray-100 overflow-hidden">
          
          {/* Avatar Section */}
          <div className="px-6 py-8 sm:px-10 sm:py-10 border-b border-gray-100">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gradient-to-br from-[#e8f4ff] to-[#f0f9ff]">
                  {(avatarPreview?.includes("/") || user?.avatar_url?.includes("/")) ? (
                    <img 
                      src={avatarPreview || user?.avatar_url} 
                      alt="Avatar" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback flex h-full w-full items-center justify-center">
                      <User className="h-14 w-14 text-[#163f73]/40" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#163f73] text-white shadow-md hover:bg-[#1f67df] hover:scale-105 transition-all">
                  <Camera className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="mt-4 text-sm text-gray-500">Klik ikon kamera untuk mengganti foto profil</p>
              <p className="text-xs text-gray-400">Maksimal 2MB (JPG, PNG)</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-8 sm:px-10 sm:py-10 border-t border-gray-100">
            {msg && (
              <div className={msgClass(msg.type)}>
                {msg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama Lengkap - Full Width */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163f73]/10">
                    <User className="h-4 w-4 text-[#163f73]" />
                  </div>
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  required 
                  value={form.nama_lengkap} 
                  onChange={e => setForm(p => ({ ...p, nama_lengkap: e.target.value }))} 
                  placeholder="Masukkan nama lengkap Anda" 
                  className={inputClass} 
                />
              </div>

              {/* Email & WhatsApp - 2 Columns */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163f73]/10">
                      <Mail className="h-4 w-4 text-[#163f73]" />
                    </div>
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                    placeholder="contoh@email.com" 
                    className={inputClass} 
                  />
                </div>
                
                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163f73]/10">
                      <Phone className="h-4 w-4 text-[#163f73]" />
                    </div>
                    No. WhatsApp
                  </label>
                  <input 
                    type="text" 
                    value={form.no_whatsapp} 
                    onChange={e => setForm(p => ({ ...p, no_whatsapp: e.target.value }))} 
                    placeholder="0812xxxxxxxx" 
                    className={inputClass} 
                  />
                </div>
              </div>

              {/* Alamat dengan Map Picker */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163f73]/10">
                    <MapPin className="h-4 w-4 text-[#163f73]" />
                  </div>
                  Alamat Lengkap
                </label>
                <textarea
                  value={form.alamat}
                  onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))}
                  placeholder="Masukkan alamat lengkap Anda (Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos)"
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
                
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    {detectingLocation ? "Mendeteksi..." : "Lokasi Saya Sekarang"}
                  </button>
                </div>

                {/* Interactive Map */}
                <div className="mt-4">
                  <MapPicker
                    lat={form.lat}
                    lng={form.lng}
                    onChange={(lat, lng, address) => setForm(p => ({ ...p, lat, lng, alamat: address || p.alamat }))}
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 flex justify-start">
                <button 
                  type="submit" 
                  disabled={saving || uploading} 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#163f73] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#163f73]/20 hover:bg-[#1f67df] hover:shadow-xl hover:shadow-[#163f73]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {uploading ? "Mengupload Foto..." : saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50/50 px-6 py-6 sm:px-8 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setShowPasswordForm(p => !p)} 
              className="flex w-full items-center justify-between rounded-xl bg-white px-5 py-4 text-left shadow-sm ring-1 ring-gray-200 hover:ring-[#163f73]/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#163f73]/10">
                  <Lock className="h-5 w-5 text-[#163f73]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Keamanan Akun</p>
                  <p className="text-xs text-gray-500">Ganti password untuk keamanan</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#163f73]">
                {showPasswordForm ? "Tutup" : "Buka"}
              </span>
            </button>
            
            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                {pwMsg && (
                  <div className={msgClass(pwMsg.type)}>
                    {pwMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                    {pwMsg.text}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Password Saat Ini</label>
                    <div className="relative">
                      <input 
                        type={showPw.current ? "text" : "password"} 
                        required 
                        value={pwForm.current} 
                        onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} 
                        placeholder="Masukkan password saat ini" 
                        className={`${inputClass} pr-12`} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPw(p => ({ ...p, current: !p.current }))} 
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-gray-600"
                      >
                        {showPw.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showPw.new ? "text" : "password"} 
                        required 
                        value={pwForm.new} 
                        onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))} 
                        placeholder="Minimal 6 karakter" 
                        className={`${inputClass} pr-12`} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPw(p => ({ ...p, new: !p.new }))} 
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-gray-600"
                      >
                        {showPw.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showPw.confirm ? "text" : "password"} 
                        required 
                        value={pwForm.confirm} 
                        onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} 
                        placeholder="Ulangi password baru" 
                        className={`${inputClass} pr-12`} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} 
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-gray-600"
                      >
                        {showPw.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={changingPw} 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#163f73] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1f67df] transition-colors disabled:opacity-50"
                >
                  {changingPw ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Simpan Password Baru
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
