import Image from "next/image";

export default function AIConsultantSection() {
  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16 lg:py-20"
      style={{
        background:
          "linear-gradient(180deg, #e9f4ff 0%, rgb(29, 94, 201) 14%, rgb(28, 84, 179) 57%, rgb(26, 75, 158) 95%, rgb(24, 65, 136) 100%)",
      }}
    >
      {/* Dekorasi awan */}
      <div className="pointer-events-none absolute top-4 -left-8 w-36 rotate-180 opacity-40 sm:w-48">
        <Image
          src="/assets/decorations/Decoration/awan_putih_nobg-1.png"
          alt=""
          width={291}
          height={216}
          className="w-full h-auto"
        />
      </div>
      <div className="pointer-events-none absolute top-4 -right-6 w-36 -scale-y-100 opacity-40 sm:w-48">
        <Image
          src="/assets/decorations/Decoration/awan_putih_nobg-1.png"
          alt=""
          width={291}
          height={216}
          className="w-full h-auto"
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 sm:px-6 text-center animate-fade-in-up">
        {/* Logo dengan pulse */}
        <div className="mx-auto mb-5 h-20 w-20 sm:h-24 sm:w-24 animate-pulse-soft">
          <Image
            src="/assets/icons/IkonHibah/logo_bg_white_large.jpeg"
            alt="TopAssist AI"
            width={153}
            height={150}
            className="h-full w-full rounded-full object-cover ring-4 ring-white/30 ring-offset-2 ring-offset-transparent"
          />
        </div>

        {/* Teks */}
        <p className="text-base font-semibold leading-snug text-white/85 drop-shadow-md sm:text-xl lg:text-2xl">
          Ingin mendapat rekomendasi dan mengajukan pertanyaan terkait produk?
        </p>

        <div className="mx-auto my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/25" />
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest">AI</span>
          <div className="h-px flex-1 bg-white/25" />
        </div>

        <h2 className="text-xl font-bold text-white drop-shadow-md sm:text-3xl lg:text-4xl">
          Gunakan Konsultan AI Sekarang!
        </h2>

        {/* CTA button */}
        <div className="mt-6 sm:mt-7">
          <a
            href="/konsultan"
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-[#163f73] shadow-lg shadow-black/20 transition-all duration-300 hover:scale-[1.04] hover:shadow-xl active:scale-[0.97] sm:px-10 sm:text-base"
          >
            Konsultan AI
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
