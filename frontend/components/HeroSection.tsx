import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className="relative z-0 overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, rgb(31, 103, 223) 0%, rgb(29, 94, 201) 11%, rgb(28, 84, 179) 34%, rgb(26, 75, 158) 95%, rgb(24, 65, 136) 100%)",
      }}
    >
      {/* Noise overlay subtle */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

      {/* Dekorasi awan — floating */}
      <div className="pointer-events-none absolute top-0 -right-12 w-40 opacity-60 sm:w-56 lg:w-72 lg:right-4 lg:top-8 animate-float-slow">
        <Image
          src="/assets/decorations/Decoration/awan_putih_nobg-1.png"
          alt=""
          width={291}
          height={216}
          className="w-full h-auto"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-36 opacity-40 -scale-y-100 sm:w-48 lg:w-72 lg:left-8 animate-float" style={{ animationDelay: "1.5s" }}>
        <Image
          src="/assets/decorations/Decoration/awan_putih_nobg-1.png"
          alt=""
          width={291}
          height={216}
          className="w-full h-auto"
        />
      </div>

      {/* Dekorasi bundar */}
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-28 opacity-25 rotate-[-7deg] sm:w-36 animate-float" style={{ animationDelay: "0.8s" }}>
        <Image
          src="/assets/decorations/Decoration/bundar_nobg-1.png"
          alt=""
          width={286}
          height={275}
          className="w-full h-auto"
        />
      </div>

      <div className="pointer-events-auto relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Teks konten */}
          <div className="text-center lg:text-left">
            <div className="animate-fade-in-left">
              <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 ring-1 ring-white/20 mb-4 sm:text-xs">
                Top Production
              </span>
              <h1 className="text-2xl font-semibold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-5xl">
                Temukan Produk{" "}
                <span className="font-black bg-gradient-to-r from-white to-[#a8cfff] bg-clip-text text-transparent">
                  Top Production
                </span>{" "}
                yang Anda Inginkan!
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base lg:max-w-md">
                Tas berkualitas untuk hobi dan aktivitas sehari-hari. Desain modern, bahan tahan lama, harga terjangkau.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 animate-fade-in-left delay-200">
              <a
                href="#produk-terlaris"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-[#163f73] shadow-lg shadow-black/20 transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-black/30 active:scale-[0.97] sm:px-9 sm:py-3.5 sm:text-base"
              >
                Belanja Sekarang
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/toko"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:text-white hover:gap-2.5 sm:text-base"
              >
                Lihat Koleksi
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Model / Hero image */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in-right delay-150">
            {/* Background shape — glow */}
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
              <div className="h-64 w-56 rounded-tl-[80px] rounded-tr-[30px] rounded-bl-[50px] rounded-br-[90px] bg-[#6baed6]/40 shadow-[0_0_80px_20px_rgba(107,174,214,0.25)] sm:h-96 sm:w-80 lg:h-[500px] lg:w-[440px]" />
            </div>
            <div className="relative z-10 h-72 w-64 sm:h-[420px] sm:w-[340px] lg:h-[600px] lg:w-[480px] animate-float" style={{ animationDelay: "0.3s" }}>
              <Image
                src="/assets/decorations/Decoration/model web.png"
                alt="Model Top Production"
                fill
                sizes="(max-width: 640px) 256px, (max-width: 1024px) 340px, 480px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
