"use client";

import Link from "next/link";
import { Users } from "lucide-react";

export default function AdminUsersPlaceholder() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] px-4 py-24 text-center">
      <Users className="mx-auto h-12 w-12 text-[#163f73]/40" />
      <h1 className="mt-4 text-lg font-bold text-[#163f73]">Pengguna</h1>
      <p className="mt-2 text-sm text-gray-500">Gunakan API GET /api/admin/users atau kembangkan UI di sini.</p>
      <Link href="/admin" className="mt-6 inline-block text-sm font-semibold text-[#163f73] underline">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
