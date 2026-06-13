import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero-section" className="relative z-0 flex min-h-[500px] items-center overflow-hidden pt-24 pb-16 sm:min-h-[600px] lg:min-h-[700px]">
      {/* Background Image */}
      <Image
        src="/assets/decorations/Decoration/header.png"
        alt="Top Production Header"
        fill
        priority
        className="object-cover object-[65%_center] sm:object-center pointer-events-none"
      />
      
      {/* Cinematic Overlay (Lebih gelap agar teks kontras) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/10 pointer-events-none" />

      <div className="pointer-events-auto relative mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="max-w-2xl text-center md:text-left">
          <div className="animate-fade-in-left">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm mb-4 sm:text-xs shadow-sm ring-1 ring-white/30">
              Top Production
            </span>
            <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
              Temukan Produk{" "}
              <span className="font-black text-[#66a3ff] drop-shadow-md">
                Top Production
              </span>{" "}
              yang Anda Inginkan!
            </h1>
            <p className="mt-4 text-sm font-medium leading-relaxed text-white/90 drop-shadow sm:text-base lg:text-lg">
              Tas berkualitas untuk hobi dan aktivitas sehari-hari. Desain modern, bahan tahan lama, harga terjangkau.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start animate-fade-in-left delay-200">
            <a
              href="#produk-terlaris"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1a5baf] px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-black/30 transition-all duration-300 hover:scale-[1.04] hover:bg-[#0055ff] hover:shadow-xl hover:shadow-black/40 active:scale-[0.97] sm:px-9 sm:py-3.5 sm:text-base"
            >
              Belanja Sekarang
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/toko"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-6 py-3 text-sm font-bold text-white drop-shadow-md backdrop-blur-sm ring-1 ring-white/20 transition-all duration-200 hover:bg-black/50 hover:gap-2.5 sm:text-base"
            >
              Lihat Koleksi
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
