"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, ShoppingBag, HelpCircle, Package, Tag, AlertCircle, Sparkles, Bot, User, MessageCircle } from "lucide-react";
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
  { icon: ShoppingBag, text: "Rekomendasikan tas pancing", color: "bg-amber-100 text-amber-600" },
  { icon: HelpCircle, text: "Produk untuk outdoor?", color: "bg-emerald-100 text-emerald-600" },
  { icon: Tag, text: "Ada diskon grosir?", color: "bg-rose-100 text-rose-600" },
  { icon: Package, text: "Produk paling murah?", color: "bg-violet-100 text-violet-600" },
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
    <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#163f73] via-[#1e4f8f] to-[#163f73] px-4 py-4 sm:px-5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-2xl bg-white p-0.5 shadow-lg shadow-black/20">
              <Image
                src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
                alt="TopAssist AI"
                width={44}
                height={44}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#163f73] bg-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white leading-tight">Konsultan AI</p>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </div>
            <p className="text-[11px] font-medium text-emerald-300 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              Online — siap membantu kamu
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 sm:px-5 space-y-6"
      >
        {/* Welcome Card */}
        {messages.length <= 1 && (
          <div className="mx-auto max-w-md">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#163f73] to-[#1e4f8f] p-5 text-white shadow-lg">
              <div className="absolute top-0 right-0 h-24 w-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <Bot className="h-5 w-5 text-amber-300" />
                  <span className="text-xs font-semibold text-amber-200">AI Assistant</span>
                </div>
                <h3 className="mb-2 text-lg font-bold">Selamat Datang! 👋</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Saya bisa membantu kamu menemukan produk tas yang tepat. Tanyakan rekomendasi, harga, diskon grosir, atau jenis produk!
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            {msg.role === "assistant" ? (
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#163f73] to-[#1e4f8f] p-0.5 shadow-md">
                  <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center">
                    <Image
                      src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
                      alt="AI"
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
            )}

            <div className={`flex max-w-[80%] sm:max-w-[75%] flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {/* Bubble */}
              {msg.error ? (
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{msg.content}</span>
                </div>
              ) : msg.role === "assistant" ? (
                <div className="rounded-2xl rounded-tl-sm bg-white px-5 py-4 text-sm leading-relaxed shadow-md border border-gray-100 max-w-[92%] sm:max-w-[88%]">
                  <div 
                    className="text-gray-700 chat-content"
                    style={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#163f73] font-semibold">$1</strong>')
                        .replace(/(\d+\.\s)/g, '<br/><span class="font-bold text-[#163f73] mr-1">$1</span>')
                        .replace(/\n/g, '<br/>')
                        .replace(/<br\/><br\/>/g, '</p><p class="mt-2">')
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#163f73] to-[#1e4f8f] px-5 py-4 text-sm leading-relaxed shadow-md">
                  <p className="text-white whitespace-pre-line">{msg.content}</p>
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

              {/* No products match - WhatsApp Custom Order */}
              {msg.role === "assistant" && 
               !msg.products?.length && 
               !isLoading &&
               (msg.content.toLowerCase().includes('tidak ada') || 
                msg.content.toLowerCase().includes('tidak menemukan') ||
                msg.content.toLowerCase().includes('tidak punya') ||
                msg.content.toLowerCase().includes('tidak memiliki') ||
                msg.content.toLowerCase().includes('belum ada') ||
                (msg.content.toLowerCase().includes('maaf') && msg.content.toLowerCase().includes('cocok'))) && (
                <div className="mt-2">
                  <a
                    href={`https://wa.me/628157799036?text=${encodeURIComponent('Halo, saya ingin custom order atau tanya produk tertentu')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat WhatsApp untuk Custom Order
                  </a>
                  <p className="mt-1.5 text-[10px] text-gray-500">Tidak menemukan yang dicari? Langsung chat admin untuk bantuan custom! 👆</p>
                </div>
              )}

            </div>
          </div>
        ))}

        {/* Typing indicator - OUTSIDE messages loop */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#163f73] to-[#1e4f8f] p-0.5 shadow-md">
              <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center">
                <Image
                  src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
                  alt="AI"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-lg object-cover"
                />
              </div>
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white px-5 py-4 shadow-md border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Sedang mengetik</span>
                <div className="flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 rounded-full bg-[#163f73] animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length <= 1 && !isLoading && (
          <div className="pt-2 space-y-4">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Coba tanyakan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-[13px] font-medium text-gray-700 shadow-sm transition-all hover:border-[#163f73]/30 hover:shadow-md hover:translate-y-[-1px]"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="group-hover:text-[#163f73] transition-colors">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Input Area ── */}
      <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-1 py-1 pl-4 focus-within:border-[#163f73]/50 focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-[#163f73]/5 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pertanyaan kamu..."
            disabled={isLoading}
            className="flex-1 bg-transparent py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#163f73] to-[#1e4f8f] text-white transition-all hover:shadow-lg hover:shadow-[#163f73]/25 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] text-gray-400">
          Dibuat dengan cermat untuk pengalaman terbaik
        </p>
      </div>
    </div>
  );
}
