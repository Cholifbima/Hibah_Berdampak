"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login?redirect=/admin");
      } else if (user.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e9f4ff]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#163f73]" />
          <p className="text-sm text-gray-500">Memeriksa akses…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
