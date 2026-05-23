"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, ShoppingBag, HelpCircle, Package, Tag, AlertCircle } from "lucide-react";
import { type Product, formatRupiah, apiUrl } from "@/lib/api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  error?: boolean;
}

interface ChatBoxProps {
  products: Product[];
}

const SUGGESTIONS = [
  { icon: ShoppingBag, text: "Rekomendasikan tas pancing" },
  { icon: HelpCircle, text: "Produk untuk outdoor?" },
  { icon: Tag, text: "Ada diskon grosir?" },
  { icon: Package, text: "Produk paling murah?" },
];

export default function ChatBox({ products: _ }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Halo! Saya Konsultan AI TopAssist 👋\nSaya bisa membantu kamu menemukan produk tas yang tepat. Tanyakan apa saja — rekomendasi, harga, diskon grosir, atau jenis produk!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(apiUrl("/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: data.error || "Terjadi kesalahan. Coba lagi ya!", error: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.reply,
            products: data.products?.length > 0 ? data.products : undefined,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Koneksi bermasalah. Pastikan server berjalan dan coba lagi.", error: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ background: "#ffffff" }}>

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 sm:px-5"
        style={{ background: "linear-gradient(135deg, #163f73 0%, #1a4f91 100%)" }}
      >
        <div className="relative shrink-0">
          <Image
            src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
            alt="TopAssist AI"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Konsultan AI TopAssist</p>
          <p className="text-[11px] font-medium text-green-300">● Online — siap membantu</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold text-white/90 ring-1 ring-white/20">
          GPT-4o mini
        </span>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-5"
        style={{ background: "#f5f7fb" }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            {msg.role === "assistant" ? (
              <Image
                src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
                alt="AI"
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-[#163f73]/20 mb-0.5"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#163f73] text-[11px] font-bold text-white mb-0.5">
                K
              </div>
            )}

            <div className={`flex max-w-[76%] sm:max-w-[70%] flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {/* Bubble */}
              {msg.error ? (
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{msg.content}</span>
                </div>
              ) : msg.role === "assistant" ? (
                <div
                  className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed shadow-sm"
                  style={{ background: "#ffffff", color: "#1e293b", border: "1px solid #e8edf5" }}
                >
                  <p style={{ whiteSpace: "pre-line", color: "#1e293b" }}>{msg.content}</p>
                </div>
              ) : (
                <div
                  className="rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
                  style={{ background: "#163f73", color: "#ffffff" }}
                >
                  <p style={{ whiteSpace: "pre-line", color: "#ffffff" }}>{msg.content}</p>
                </div>
              )}

              {/* Product cards */}
              {msg.products && msg.products.length > 0 && (
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {msg.products.map((p) => {
                    const hasDiscount = p.discounts.length > 0;
                    const lowestGrosir = hasDiscount ? Math.min(...p.discounts.map((d) => d.harga_grosir)) : null;
                    return (
                      <Link
                        key={p.id_product}
                        href={`/toko/detail?id=${p.id_product}`}
                        className="flex gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 transition-all hover:ring-[#163f73]/30 hover:shadow-md"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#e9f4ff]">
                          {p.gambar_url
                            ? <Image src={p.gambar_url} alt={p.nama_produk} fill sizes="64px" className="object-contain p-1.5" />
                            : <div className="flex h-full items-center justify-center text-2xl">🛍️</div>}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <p className="text-[12px] font-semibold leading-snug text-gray-800 line-clamp-2">{p.nama_produk}</p>
                          {hasDiscount && lowestGrosir && (
                            <p className="mt-0.5 text-[10px] text-gray-400 line-through">{formatRupiah(p.harga_satuan)}</p>
                          )}
                          <p className="mt-0.5 text-[13px] font-extrabold text-[#163f73]">
                            {hasDiscount && lowestGrosir ? formatRupiah(lowestGrosir) : formatRupiah(p.harga_satuan)}
                          </p>
                          {hasDiscount && (
                            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">GROSIR</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <Image
              src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
              alt="AI"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-[#163f73]/20 mb-0.5"
            />
            <div className="rounded-2xl rounded-bl-sm bg-white px-5 py-3.5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-1.5">
                {[0, 160, 320].map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 rounded-full bg-[#163f73]/35 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length <= 1 && !isLoading && (
          <div className="pt-1 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Coba tanyakan:</p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-[12px] font-semibold text-gray-600 shadow-sm transition-all hover:border-[#163f73]/40 hover:bg-[#e9f4ff] hover:text-[#163f73] hover:shadow-md"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e9f4ff] text-[#163f73]">
                    <s.icon className="h-3.5 w-3.5" />
                  </span>
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Input Area ── */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#f8fafc] px-1 py-1 pl-4 focus-within:border-[#163f73]/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#163f73]/10 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya produk, rekomendasi, harga…"
            disabled={isLoading}
            className="flex-1 bg-transparent py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#163f73] text-white transition-all hover:bg-[#0f2d55] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          Didukung GPT-4o mini · Rekomendasi berdasarkan katalog TopAssist
        </p>
      </div>
    </div>
  );
}
