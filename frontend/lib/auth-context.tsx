"use client";



import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";



import { apiUrl } from "./api";



export interface AuthUser {
  id_user: number;
  nama_lengkap: string;
  username: string;
  email: string | null;
  no_whatsapp?: string;
  alamat?: string | null;
  lat?: number | null;
  lng?: number | null;
  avatar_url?: string | null;
  role: string;
}



interface AuthContextValue {

  user: AuthUser | null;

  token: string | null;

  loading: boolean;

  login: (username: string, password: string) => Promise<void>;

  register: (data: { nama_lengkap: string; username: string; email?: string; no_whatsapp?: string; password: string }) => Promise<void>;

  loginWithGoogle: (googleData: { google_id: string; email: string; name: string }) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  logout: () => void;

}



const AuthContext = createContext<AuthContextValue | null>(null);



const TOKEN_KEY = "topassist_token";

const USER_KEY = "topassist_user";



function saveSession(token: string, user: AuthUser) {

  localStorage.setItem(TOKEN_KEY, token);

  localStorage.setItem(USER_KEY, JSON.stringify(user));

}



function clearSession() {

  localStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(USER_KEY);

}



function loadUser(): AuthUser | null {

  if (typeof window === "undefined") return null;

  try {

    const raw = localStorage.getItem(USER_KEY);

    return raw ? JSON.parse(raw) : null;

  } catch {

    return null;

  }

}



function loadToken(): string | null {

  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);

}

/**
 * Decode JWT payload tanpa library tambahan untuk cek expiration client-side.
 */
function decodeJwtPayload(token: string): { exp?: number; id?: number; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Cek apakah token sudah expired berdasarkan exp claim.
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  // Tambah buffer 30 detik untuk menghindari race condition
  return Date.now() >= (payload.exp * 1000 - 30_000);
}

/**
 * Cek apakah token akan expired dalam waktu dekat (< 1 hari).
 * Digunakan untuk proactive refresh.
 */
function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Date.now() >= (payload.exp * 1000 - oneDayMs);
}


export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVerifyingRef = useRef(false);



  const handleAuthResponse = useCallback((data: { token: string; user: AuthUser }) => {

    saveSession(data.token, data.user);

    setUser(data.user);

    setToken(data.token);

  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Coba refresh token. Return true jika berhasil, false jika gagal.
   */
  const tryRefreshToken = useCallback(async (currentToken: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token && data.user) {
        handleAuthResponse(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [handleAuthResponse]);

  /**
   * Setup timer untuk proactive refresh sebelum token expired.
   */
  const scheduleTokenRefresh = useCallback((currentToken: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const payload = decodeJwtPayload(currentToken);
    if (!payload?.exp) return;

    // Refresh 1 jam sebelum expired
    const refreshAt = (payload.exp * 1000) - (60 * 60 * 1000);
    const delay = refreshAt - Date.now();

    if (delay <= 0) {
      // Token sudah mendekati expired, langsung refresh
      tryRefreshToken(currentToken);
      return;
    }

    // Max timeout ~24 hari (setTimeout limit), tapi kita cap di 12 jam
    const cappedDelay = Math.min(delay, 12 * 60 * 60 * 1000);

    refreshTimerRef.current = setTimeout(() => {
      const latestToken = loadToken();
      if (latestToken) {
        tryRefreshToken(latestToken);
      }
    }, cappedDelay);
  }, [tryRefreshToken]);

  /**
   * Verifikasi token saat app pertama kali load.
   * Flow: 
   * 1. Cek ada token di localStorage?
   * 2. Cek token expired secara client-side?
   *    - Jika belum expired → verify ke backend → jika OK, pakai. Jika 401, logout.
   *    - Jika sudah expired → coba refresh → jika OK, pakai token baru. Jika gagal, logout.
   * 3. Jika token masih valid tapi expiring soon → proactive refresh
   */
  useEffect(() => {
    async function verifyStoredToken() {
      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;

      const storedToken = loadToken();
      const storedUser = loadUser();

      if (!storedToken || !storedUser) {
        clearSession();
        setUser(null);
        setToken(null);
        setLoading(false);
        isVerifyingRef.current = false;
        return;
      }

      // Quick client-side check
      if (isTokenExpired(storedToken)) {
        // Token sudah expired, coba refresh (grace period 24 jam di backend)
        console.log("[Auth] Token expired, mencoba refresh...");
        const refreshed = await tryRefreshToken(storedToken);
        if (!refreshed) {
          console.log("[Auth] Refresh gagal, auto-logout");
          clearSession();
          setUser(null);
          setToken(null);
        }
        setLoading(false);
        isVerifyingRef.current = false;
        return;
      }

      // Token belum expired secara client-side, verify ke backend
      try {
        const res = await fetch(apiUrl("/auth/verify"), {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Update user data dari database (mungkin ada perubahan)
          saveSession(storedToken, data.user);
          setUser(data.user);
          setToken(storedToken);

          // Schedule proactive refresh jika token expiring soon
          if (isTokenExpiringSoon(storedToken)) {
            console.log("[Auth] Token expiring soon, proactive refresh...");
            await tryRefreshToken(storedToken);
          } else {
            scheduleTokenRefresh(storedToken);
          }
        } else {
          // Backend menolak token (mungkin JWT_SECRET berubah, user dihapus, dll)
          console.log("[Auth] Verify gagal, mencoba refresh...");
          const refreshed = await tryRefreshToken(storedToken);
          if (!refreshed) {
            console.log("[Auth] Refresh juga gagal, auto-logout");
            clearSession();
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        // Network error — gunakan data offline (jangan logout, nanti retry saat ada koneksi)
        console.warn("[Auth] Verify gagal (network?), pakai cached data:", err);
        setUser(storedUser);
        setToken(storedToken);
      }

      setLoading(false);
      isVerifyingRef.current = false;
    }

    verifyStoredToken();

    // Listen untuk events dari authFetch (api.ts)
    function handleForceLogout() {
      setUser(null);
      setToken(null);
    }

    function handleTokenRefreshed(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.token && detail?.user) {
        setUser(detail.user);
        setToken(detail.token);
      }
    }

    window.addEventListener("auth-force-logout", handleForceLogout);
    window.addEventListener("auth-token-refreshed", handleTokenRefreshed);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      window.removeEventListener("auth-force-logout", handleForceLogout);
      window.removeEventListener("auth-token-refreshed", handleTokenRefreshed);
    };
  }, [tryRefreshToken, scheduleTokenRefresh]);



  const login = useCallback(async (username: string, password: string) => {

    const res = await fetch(apiUrl("/auth/login"), {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ username, password }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Gagal login");

    handleAuthResponse(data);
    scheduleTokenRefresh(data.token);

  }, [handleAuthResponse, scheduleTokenRefresh]);



  const register = useCallback(async (formData: { nama_lengkap: string; username: string; email?: string; no_whatsapp?: string; password: string; turnstile_token?: string }) => {
    const res = await fetch(apiUrl("/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Gagal membuat akun");

    handleAuthResponse(data);
    scheduleTokenRefresh(data.token);

  }, [handleAuthResponse, scheduleTokenRefresh]);



  const loginWithGoogle = useCallback(async (googleData: { google_id: string; email: string; name: string }) => {

    const res = await fetch(apiUrl("/auth/google"), {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(googleData),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Gagal login dengan Google");

    handleAuthResponse(data);
    scheduleTokenRefresh(data.token);

  }, [handleAuthResponse, scheduleTokenRefresh]);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    if (!token) throw new Error("Tidak ada token");
    const res = await fetch(apiUrl("/users/me"), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal update profil");
    const updated: AuthUser = {
      id_user: json.id_user,
      nama_lengkap: json.nama_lengkap,
      username: json.username,
      email: json.email,
      no_whatsapp: json.no_whatsapp,
      alamat: json.alamat,
      lat: json.lat,
      lng: json.lng,
      avatar_url: json.avatar_url,
      role: json.role,
    };
    saveSession(token, updated);
    setUser(updated);
  }, [token]);



  return (

    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, updateProfile, logout }}>

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within AuthProvider");

  return ctx;

}

