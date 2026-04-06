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
      {/* Dekorasi awan */}
      <div className="pointer-events-none absolute top-0 -right-12 w-40 opacity-70 sm:w-56 lg:w-72 lg:right-4 lg:top-8">
        <Image
          src="/assets/decorations/Decoration/awan_putih_nobg-1.png"
          alt=""
          width={291}
          height={216}
          className="w-full h-auto"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-36 opacity-50 -scale-y-100 sm:w-48 lg:w-72 lg:left-8">
        <Image
          src="/assets/decorations/Decoration/awan_putih_nobg-1.png"
          alt=""
          width={291}
          height={216}
          className="w-full h-auto"
        />
      </div>

      {/* Dekorasi bundar */}
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-28 opacity-30 rotate-[-7deg] sm:w-36">
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
            <h1 className="text-2xl font-semibold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-5xl">
              Temukan Produk{" "}
              <span className="font-black">Top Production</span>{" "}
              yang Anda Inginkan!
            </h1>

            <div className="mt-6 sm:mt-8">
              <a
                href="#produk-terlaris"
                className="inline-flex items-center rounded-2xl border-2 border-white px-8 py-3 text-sm font-light uppercase text-white hover:bg-white/10 transition-colors sm:px-10 sm:py-3.5 sm:text-base"
              >
                jelajahi sekarang
              </a>
            </div>
          </div>

          {/* Model / Hero image */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Background shape */}
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
              <div className="h-52 w-44 rounded-tl-[80px] rounded-tr-[30px] rounded-bl-[50px] rounded-br-[90px] bg-[#6baed6]/50 sm:h-72 sm:w-60 lg:h-[420px] lg:w-[360px]" />
            </div>
            <div className="relative z-10 h-56 w-48 sm:h-72 sm:w-60 lg:h-[500px] lg:w-[400px]">
              <Image
                src="/assets/decorations/Decoration/model2_nobg-1.png"
                alt="Model Top Production"
                fill
                sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 400px"
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
