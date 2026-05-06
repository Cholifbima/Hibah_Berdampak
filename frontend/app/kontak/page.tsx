"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KontakPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke homepage lalu scroll ke section kontak (footer)
    router.replace("/#kontak");
  }, [router]);

  return null;
}
