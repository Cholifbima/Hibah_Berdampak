import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  return raw.replace(/\/$/, "");
}
