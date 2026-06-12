import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Target, ShieldCheck } from "lucide-react";

export default function AIConsultantSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#f2f8ff] to-[#e6f2ff] px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 shadow-sm border border-blue-100/50">
          
          {/* Dekorasi Background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
            
            {/* Kiri: Teks & CTA */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 backdrop-blur-sm border border-blue-100 mb-6 shadow-sm">
                <Sparkles className="h-4 w-4 text-[#0066ff]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#163f73]">Konsultan AI TopAssist</span>
              </div>

              <h2 className="text-3xl font-extrabold text-[#0f2d55] sm:text-4xl lg:text-5xl leading-[1.15]">
                Bingung memilih produk yang tepat?
              </h2>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-gray-600 lg:max-w-xl mx-auto lg:mx-0">
                Tanyakan kebutuhan Anda kepada AI kami dan dapatkan rekomendasi produk terbaik, informasi harga grosir, dan solusi yang paling sesuai untuk Anda.
              </p>

              <div className="mt-8">
                <Link
                  href="/konsultan"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-[#0f2d55] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#0f2d55]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#0066ff] hover:shadow-2xl sm:text-base"
                >
                  <Sparkles className="h-4 w-4" />
                  Coba Konsultan AI Sekarang
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Fitur Bawah */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 sm:gap-8 border-t border-blue-200/50 pt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0066ff] shadow-sm">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-[#163f73]">Jawaban Instan 24/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0066ff] shadow-sm">
                    <Target className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-[#163f73]">Rekomendasi Tepat</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0066ff] shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-[#163f73]">Aman &amp; Terpercaya</span>
                </div>
              </div>
            </div>

            {/* Kanan: Gambar Chatbot */}
            <div className="flex-1 w-full max-w-[280px] sm:max-w-sm lg:max-w-full">
              <div className="relative aspect-square w-full transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="/assets/icons/IkonHibah/chatbot.png"
                  alt="TopAssist AI Chatbot"
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
