"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

let gsiInitialized = false;

interface GoogleCredentialResponse {
  credential: string;
}

function decodeJwt(token: string) {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(atob(padded));
}

interface GoogleLoginButtonProps {
  containerId?: string;
}

export default function GoogleLoginButton({ containerId = "google-signin-btn" }: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const callbackRef = useRef<(r: GoogleCredentialResponse) => void>(() => {});

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        const decoded = decodeJwt(response.credential);
        await loginWithGoogle({
          google_id: decoded.sub,
          email: decoded.email,
          name: decoded.name ?? decoded.email,
        });
        window.location.href = "/";
      } catch (err) {
        console.error("Google login failed:", err);
      }
    },
    [loginWithGoogle]
  );

  callbackRef.current = handleCredentialResponse;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const el = document.getElementById(containerId);
    if (!el) return;

    const init = () => {
      const gsi = (
        window as unknown as {
          google?: { accounts: { id: { initialize: (o: object) => void; renderButton: (el: HTMLElement, o: object) => void } } };
        }
      ).google;
      if (!gsi?.accounts?.id) return;

      if (!gsiInitialized) {
        gsi.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (r: GoogleCredentialResponse) => callbackRef.current(r),
          ux_mode: "popup",
          auto_select: false,
        });
        gsiInitialized = true;
      }
      el.innerHTML = "";
      const w = el.getBoundingClientRect().width;
      gsi.accounts.id.renderButton(el, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: w > 40 ? Math.floor(w) : 400,
        locale: "id",
      });
    };

    const scheduleInit = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(init);
      });
    };

    const scriptSrc = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existing) {
      if (
        (window as unknown as { google?: { accounts: { id: unknown } } }).google?.accounts?.id
      ) {
        scheduleInit();
      } else {
        existing.addEventListener("load", scheduleInit, { once: true });
      }
      return () => {
        el.innerHTML = "";
      };
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = scheduleInit;
    document.head.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, [handleCredentialResponse, containerId]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-3.5 text-sm font-medium text-white/50"
      >
        <GoogleG />
        Lanjutkan dengan Google (atur Client ID)
      </button>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/20 [&>div]:flex [&>div]:w-full [&>div]:justify-center">
      <div id={containerId} className="flex min-h-[48px] w-full items-center justify-center px-1 py-0.5" />
    </div>
  );
}

function GoogleG() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
