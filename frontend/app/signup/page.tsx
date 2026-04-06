"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import AuthUnderlineField from "@/components/auth/AuthUnderlineField";

const BG =
  "linear-gradient(180deg, rgb(31, 103, 223) 0%, rgb(28, 84, 179) 42%, rgb(22, 58, 120) 100%)";

function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  return raw;
}

function SignupForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterLogin = safeRedirect(searchParams.get("redirect"));

  const [namaLengkap, setNamaLengkap] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPw) {
      setError("Password tidak cocok");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await register({
        nama_lengkap: namaLengkap.trim() || username,
        username,
        email: email || undefined,
        no_whatsapp: noWhatsapp || undefined,
        password,
      });
      router.push(afterLogin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: BG }}>
      <div className="pointer-events-none absolute -left-16 top-1/4 h-40 w-40 rounded-full bg-emerald-400/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-10 bottom-1/3 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="pointer-events-none absolute right-1/4 top-32 h-20 w-20 rounded-full bg-white/10 blur-xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 pb-12 pt-10 sm:px-8 sm:pt-12">
        <div className="flex flex-col items-center">
          <div className="relative h-[100px] w-[100px] sm:h-[120px] sm:w-[120px]">
            <Image
              src="/assets/icons/IkonHibah/logo_bg_white-small.png"
              alt="TopAssist"
              fill
              className="rounded-full object-cover shadow-lg ring-4 ring-white/30"
              priority
            />
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl">
            TopAssist
          </h1>
          <p className="mt-2 text-center text-sm text-white/75">Sign Up</p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-center text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-5">
          <AuthUnderlineField
            id="signup-nama"
            label="Nama lengkap"
            value={namaLengkap}
            onChange={setNamaLengkap}
            placeholder="Nama sesuai identitas"
            autoComplete="name"
          />

          <AuthUnderlineField
            id="signup-username"
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Pilih username unik"
            autoComplete="username"
            required
          />

          <AuthUnderlineField
            id="signup-email"
            label="Email (opsional)"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nama@email.com"
            autoComplete="email"
          />

          <AuthUnderlineField
            id="signup-wa"
            label="WhatsApp (opsional)"
            type="tel"
            value={noWhatsapp}
            onChange={setNoWhatsapp}
            placeholder="08xxxxxxxxxx"
            autoComplete="tel"
          />

          <div>
            <label
              htmlFor="signup-password"
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs"
            >
              Password
            </label>
            <div className="relative flex items-center border-b-2 border-white/35 pb-1.5 transition-colors focus-within:border-white">
              <input
                id="signup-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full min-w-0 flex-1 bg-transparent py-1 pr-10 text-sm text-white placeholder:text-white/45 focus:outline-none sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="shrink-0 text-white/70 transition-colors hover:text-white"
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-verify"
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs"
            >
              Verifikasi password
            </label>
            <div className="relative flex items-center border-b-2 border-white/35 pb-1.5 transition-colors focus-within:border-white">
              <input
                id="signup-verify"
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Ulangi password"
                autoComplete="new-password"
                required
                className="w-full min-w-0 flex-1 bg-transparent py-1 text-sm text-white placeholder:text-white/45 focus:outline-none sm:text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-white py-3.5 text-center text-base font-bold text-[#0031fd] shadow-md transition hover:bg-white/95 disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Sign Up"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <hr className="flex-1 border-white/25" />
          <span className="text-xs font-medium uppercase tracking-wider text-white/60">atau</span>
          <hr className="flex-1 border-white/25" />
        </div>

        <GoogleLoginButton containerId="google-signin-signup" redirectAfterLogin={afterLogin} />

        <p className="mt-8 text-center text-base text-white/90">
          Sudah punya akun?{" "}
          <Link
            href={afterLogin !== "/" ? `/login?redirect=${encodeURIComponent(afterLogin)}` : "/login"}
            className="font-black italic text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: BG }}>
          <p className="text-sm text-white/80">Memuat…</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
