"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [pesanBackend, setPesanBackend] = useState("Sedang mencari sinyal backend...");

  useEffect(() => {
    // Ini perintah untuk mengetuk pintu Express.js milikmu di Port 5000
    fetch("http://localhost:5000")
      .then((respons) => respons.json())
      .then((data) => setPesanBackend(data.message))
      .catch((error) => setPesanBackend("Waduh, backend-nya belum nyambung nih!"));
  }, []);

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