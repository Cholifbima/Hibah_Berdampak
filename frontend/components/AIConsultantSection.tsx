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

      <div className="relative mx-auto max-w-3xl px-5 sm:px-6 text-center">
        {/* Teks */}
        <p className="text-base font-semibold leading-snug text-white drop-shadow-md sm:text-xl lg:text-2xl">
          Ingin mendapat rekomendasi dan mengajukan pertanyaan terkait produk?
        </p>

        <div className="mx-auto my-4 h-px w-3/4 bg-white/40 sm:my-5" />

        <h2 className="text-xl font-bold text-white drop-shadow-md sm:text-3xl lg:text-4xl">
          Gunakan Konsultan AI Sekarang!
        </h2>

        {/* Logo */}
        <div className="mx-auto mt-6 h-20 w-20 sm:h-24 sm:w-24">
          <Image
            src="/assets/icons/IkonHibah/logo_bg_white-small.png"
            alt="TopAssist AI"
            width={153}
            height={150}
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        {/* CTA button */}
        <div className="mt-5 sm:mt-6">
          <a
            href="/konsultan"
            className="inline-flex items-center rounded-2xl border-2 border-white px-8 py-3 text-sm font-light uppercase text-white hover:bg-white/10 transition-colors sm:px-10 sm:text-base"
          >
            Konsultan AI
          </a>
        </div>
      </div>
    </section>
  );
}
