"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Bot, User, Sparkles, ShoppingBag, HelpCircle, Package } from "lucide-react";
import { type Product, formatRupiah } from "@/lib/api";
import Link from "next/link";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

const SUGGESTIONS = [
  { icon: ShoppingBag, text: "Rekomendasikan tas pancing" },
  { icon: HelpCircle, text: "Apa produk terlaris?" },
  { icon: Package, text: "Ada tas hewan apa saja?" },
];

interface ChatBoxProps {
  products: Product[];
}

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
    return {
      text: "Halo! Selamat datang di TopAssist Konsultan AI. Saya bisa membantu Anda menemukan produk yang tepat, memberikan rekomendasi, atau menjawab pertanyaan tentang produk kami. Silakan tanya apa saja!",
      matched: [],
    };
  }

  if (q.includes("terlaris") || q.includes("populer") || q.includes("best seller") || q.includes("favorit")) {
    const top = products.filter((p) => p.stok > 0 && p.nama_produk.trim() !== "").slice(0, 4);
    return {
      text: "Berikut beberapa produk terlaris kami saat ini:",
      matched: top,
    };
  }

  if (q.includes("murah") || q.includes("termurah") || q.includes("harga rendah")) {
    const cheap = [...products]
      .filter((p) => p.nama_produk.trim() !== "" && p.stok > 0)
      .sort((a, b) => a.harga_satuan - b.harga_satuan)
      .slice(0, 4);
    return {
      text: "Berikut produk dengan harga paling terjangkau:",
      matched: cheap,
    };
  }

  if (q.includes("grosir") || q.includes("diskon") || q.includes("wholesale")) {
    const withDiscount = products
      .filter((p) => p.discounts.length > 0 && p.nama_produk.trim() !== "")
      .slice(0, 4);
    return {
      text: "Berikut produk yang memiliki harga grosir spesial. Semakin banyak beli, semakin hemat!",
      matched: withDiscount,
    };
  }

  if (q.includes("kategori") || q.includes("jenis")) {
    const cats = [...new Set(products.filter((p) => p.nama_produk.trim() !== "").map((p) => p.kategori))]
      .filter(Boolean)
      .sort();
    return {
      text: `Kami memiliki produk di ${cats.length} kategori:\n${cats.map((c) => `• ${c}`).join("\n")}\n\nSilakan tanya produk di kategori tertentu!`,
      matched: [],
    };
  }

  const matched = searchProducts(q, products);

  if (matched.length > 0) {
    return {
      text: `Saya menemukan ${matched.length} produk yang cocok dengan pencarian Anda:`,
      matched,
    };
  }

  return {
    text: "Maaf, saya belum menemukan produk yang sesuai. Coba gunakan kata kunci lain seperti nama produk, kategori (tas pancing, tas hewan, dll), atau tanya tentang produk terlaris dan harga grosir.",
    matched: [],
  };
}

export default function ChatBox({ products }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Halo! Saya Konsultan AI TopAssist. Saya bisa membantu Anda menemukan produk yang tepat. Silakan tanyakan apa saja tentang produk kami!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { text: reply, matched } = generateResponse(msg, products);
      const botMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
        products: matched.length > 0 ? matched : undefined,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm" style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}>
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src="/assets/icons/IkonHibah/logo_bg_white-small.png"
            alt="AI"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#163f73]">Konsultan AI TopAssist</h3>
          <p className="text-xs text-green-600">Online — Siap membantu</p>
        </div>
        <Sparkles className="ml-auto h-5 w-5 text-[#163f73]/40" />
      </div>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-[#163f73]" : "bg-gray-200"}`}>
              {msg.role === "assistant" ? (
                <Bot className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "rounded-tl-md bg-[#e9f4ff] text-gray-700"
                    : "rounded-tr-md bg-[#163f73] text-white"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>

              {/* Product cards */}
              {msg.products && msg.products.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {msg.products.map((p) => (
                    <Link
                      key={p.id_product}
                      href={`/toko/${p.id_product}`}
                      className="flex gap-2.5 rounded-xl border border-gray-100 bg-white p-2.5 hover:border-[#163f73]/30 hover:shadow-sm transition-all"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
                        {p.gambar_url ? (
                          <Image
                            src={p.gambar_url}
                            alt={p.nama_produk}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">🛍️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1a1a1a] line-clamp-1">{p.nama_produk}</p>
                        <p className="text-xs font-extrabold text-[#163f73]">{formatRupiah(p.harga_satuan)}</p>
                        {p.discounts.length > 0 && (
                          <span className="mt-0.5 inline-block rounded bg-[#163f73] px-1.5 py-0.5 text-[8px] font-bold text-white">
                            GROSIR
                          </span>
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
            <div className="rounded-2xl rounded-tl-md bg-[#e9f4ff] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick suggestions — only show at start */}
        {messages.length <= 1 && !isTyping && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-gray-400">Coba tanyakan:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-[#163f73]/30 hover:bg-[#e9f4ff] transition-colors"
                >
                  <s.icon className="h-3.5 w-3.5 text-[#163f73]" />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#163f73] focus:ring-2 focus:ring-[#163f73]/20 focus:outline-none transition-colors"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#163f73] text-white hover:bg-[#0f2d55] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          AI ini memberikan rekomendasi berdasarkan katalog produk TopAssist.
        </p>
      </div>
    </div>
  );
}
