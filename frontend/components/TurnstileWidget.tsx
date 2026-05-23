"use client";

import { useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Shield, CheckCircle } from "lucide-react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

// Cloudflare Turnstile Site Key (public key)
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

// Check if running on localhost/development
const isDevelopment = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" ||
   window.location.hostname.includes(".local"));

export function TurnstileWidget({ onVerify, onError }: TurnstileWidgetProps) {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Auto-verify in development mode
    if (isDevelopment) {
      setIsDevMode(true);
      // Simulate verification delay
      const timer = setTimeout(() => {
        onVerify("dev-mode-token");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onVerify]);

  // Development mode - show bypass message
  if (isDevMode) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-700">
        <CheckCircle className="h-4 w-4" />
        <span>Development Mode - Verifikasi dilewati</span>
      </div>
    );
  }

  // Production mode - show actual Turnstile widget
  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={onVerify}
        onError={onError}
        options={{
          theme: "light",
          size: "normal",
        }}
      />
    </div>
  );
}
