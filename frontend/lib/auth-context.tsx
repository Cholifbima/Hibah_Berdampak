"use client";



import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";



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



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    setUser(loadUser());

    setToken(loadToken());

    setLoading(false);

  }, []);



  const handleAuthResponse = useCallback((data: { token: string; user: AuthUser }) => {

    saveSession(data.token, data.user);

    setUser(data.user);

    setToken(data.token);

  }, []);



  const login = useCallback(async (username: string, password: string) => {

    const res = await fetch(apiUrl("/auth/login"), {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ username, password }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Gagal login");

    handleAuthResponse(data);

  }, [handleAuthResponse]);



  const register = useCallback(async (formData: { nama_lengkap: string; username: string; email?: string; no_whatsapp?: string; password: string }) => {

    const res = await fetch(apiUrl("/auth/register"), {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(formData),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Gagal membuat akun");

    handleAuthResponse(data);

  }, [handleAuthResponse]);



  const loginWithGoogle = useCallback(async (googleData: { google_id: string; email: string; name: string }) => {

    const res = await fetch(apiUrl("/auth/google"), {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(googleData),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Gagal login dengan Google");

    handleAuthResponse(data);

  }, [handleAuthResponse]);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    const t = loadToken();
    if (!t) throw new Error("Tidak ada token");
    const res = await fetch(apiUrl("/users/me"), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
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
    saveSession(t, updated);
    setUser(updated);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);



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

