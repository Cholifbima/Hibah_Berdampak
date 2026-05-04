import { getApiBaseUrl } from "@/lib/utils";

async function getBackendMessage(): Promise<string> {
  try {
    const res = await fetch(getApiBaseUrl(), {
      cache: "no-store",
    });
    if (!res.ok) return "Backend merespons error. Cek endpoint /api di server.";
    const data = (await res.json()) as { message?: string };
    return data.message || "Backend hidup, tapi message kosong.";
  } catch {
    return "Waduh, backend-nya belum nyambung nih!";
  }
}

export default async function Home() {
  const pesanBackend = await getBackendMessage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 font-sans">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
        Website Top Production 🎒
      </h1>
      
      <div className="p-6 bg-white rounded-xl shadow-md border-t-4 border-green-500">
        <h2 className="text-gray-500 text-sm font-semibold mb-2">PESAN DARI SERVER BACKEND:</h2>
        <p className="text-xl text-green-700 font-medium">{pesanBackend}</p>
      </div>
    </div>
  );
}