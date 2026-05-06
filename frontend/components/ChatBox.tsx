"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, Bot, User, ShoppingBag, HelpCircle, Package, Tag } from "lucide-react";
import { type Product, formatRupiah } from "@/lib/api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

interface ChatBoxProps {
  products: Product[];
}

const SUGGESTIONS = [
  { icon: ShoppingBag, text: "Rekomendasikan tas pancing" },
  { icon: HelpCircle, text: "Apa produk terlaris?" },
  { icon: Tag, text: "Ada diskon grosir?" },
  { icon: Package, text: "Produk paling murah?" },
];

function searchProducts(query: string, products: Product[]): Product[] {
  const q = query.toLowerCase();
  return products
    .filter(
      (p) =>
        p.nama_produk.trim() !== "" &&
        (p.nama_produk.toLowerCase().includes(q) ||
          p.deskripsi.toLowerCase().includes(q) ||
          p.kategori.toLowerCase().includes(q))
    )
    .slice(0, 6);
}

function generateResponse(input: string, products: Product[]): { text: string; matched: Product[] } {
  const q = input.toLowerCase();

  if (q.includes("halo") || q.includes("hai") || q.includes("hi") || q.includes("hey")) {
    return { text: "Halo! Selamat datang di TopAssist. Saya siap membantu Anda menemukan produk yang tepat, memberikan rekomendasi, atau menjawab pertanyaan tentang produk kami. Silakan tanya apa saja!", matched: [] };
  }
  if (q.includes("terlaris") || q.includes("populer") || q.includes("best seller") || q.includes("favorit")) {
    return { text: "Berikut beberapa produk terlaris kami:", matched: products.filter((p) => p.stok > 0 && p.nama_produk.trim() !== "").slice(0, 4) };
  }
  if (q.includes("murah") || q.includes("termurah") || q.includes("harga rendah")) {
    return {
      text: "Ini produk dengan harga paling terjangkau:",
      matched: [...products].filter((p) => p.nama_produk.trim() !== "" && p.stok > 0).sort((a, b) => a.harga_satuan - b.harga_satuan).slice(0, 4),
    };
  }
  if (q.includes("grosir") || q.includes("diskon") || q.includes("wholesale")) {
    return { text: "Produk berikut punya harga grosir spesial — makin banyak beli, makin hemat!", matched: products.filter((p) => p.discounts.length > 0 && p.nama_produk.trim() !== "").slice(0, 4) };
  }
  if (q.includes("kategori") || q.includes("jenis")) {
    const cats = [...new Set(products.filter((p) => p.nama_produk.trim() !== "").map((p) => p.kategori))].filter(Boolean).sort();
    return { text: `Kami punya produk di ${cats.length} kategori:\n${cats.map((c) => `• ${c}`).join("\n")}\n\nTanya produk di kategori tertentu!`, matched: [] };
  }

  const matched = searchProducts(q, products);
  if (matched.length > 0) {
    return { text: `Saya menemukan ${matched.length} produk yang cocok:`, matched };
  }
  return { text: "Maaf, belum menemukan produk yang sesuai. Coba kata kunci lain seperti nama produk, kategori (tas pancing, tas hewan, dll), atau tanya produk terlaris / harga grosir.", matched: [] };
}

export default function ChatBox({ products }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "Halo! Saya Konsultan AI TopAssist. Saya bisa membantu Anda menemukan produk yang tepat. Silakan tanyakan apa saja tentang produk kami!" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: msg }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const { text: reply, matched } = generateResponse(msg, products);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: reply, products: matched.length > 0 ? matched : undefined }]);
      setIsTyping(false);
    }, 600 + Math.random() * 700);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f0f4f8]">

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${msg.role === "assistant" ? "bg-[#163f73]" : "bg-[#1f67df]"}`}>
              {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>

            <div className={`max-w-[75%] sm:max-w-[65%] space-y-2 ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
              {/* Bubble */}
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "rounded-tl-sm bg-white text-gray-800 shadow-sm"
                  : "rounded-tr-sm bg-[#163f73] text-white"
              }`}>
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>

              {/* Product cards */}
              {msg.products && msg.products.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full">
                  {msg.products.map((p) => (
                    <Link
                      key={p.id_product}
                      href={`/toko/detail?id=${p.id_product}`}
                      className="flex gap-2.5 rounded-xl border border-gray-100 bg-white p-2.5 hover:border-[#163f73]/30 hover:shadow-sm transition-all"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#e9f4ff]">
                        {p.gambar_url
                          ? <Image src={p.gambar_url} alt={p.nama_produk} fill sizes="56px" className="object-contain p-1" />
                          : <div className="flex h-full items-center justify-center text-xl">🛍️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 leading-tight">{p.nama_produk}</p>
                        <p className="mt-1 text-[12px] font-extrabold text-[#163f73]">{formatRupiah(p.harga_satuan)}</p>
                        {p.discounts.length > 0 && (
                          <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">GROSIR</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#163f73]">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-[#163f73]/40" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length <= 1 && !isTyping && (
          <div className="pt-2 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Coba tanyakan:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600 hover:border-[#163f73]/40 hover:bg-[#e9f4ff] hover:text-[#163f73] transition-colors shadow-sm"
                >
                  <s.icon className="h-3.5 w-3.5 text-[#163f73]" />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Input Area ── */}
      <div className="border-t border-gray-200 bg-white px-4 pb-safe py-3 sm:px-8">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan Anda…"
            disabled={isTyping}
            className="flex-1 rounded-full border border-gray-200 bg-[#f6f8fa] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#163f73] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#163f73]/15 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#163f73] text-white hover:bg-[#0f2d55] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          AI ini merekomendasikan berdasarkan katalog produk TopAssist.
        </p>
      </div>
    </div>
  );
}
