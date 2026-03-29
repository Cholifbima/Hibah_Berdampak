export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Dekorasi awan / lingkaran */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-60 w-60 rounded-full bg-cyan-300/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-blue-300/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Teks */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Temukan Produk{" "}
              <span className="text-yellow-300">Top Production</span>{" "}
              yang Anda Inginkan!
            </h1>
            <p className="mt-4 text-lg text-blue-100 max-w-lg mx-auto lg:mx-0">
              Konveksi tas dan produk custom berkualitas tinggi dengan harga bersahabat.
              Dari tas pancing sampai perlengkapan olahraga — semuanya buatan pengrajin berpengalaman.
            </p>
            <div className="mt-8">
              <a
                href="#produk-kami"
                className="inline-flex items-center rounded-full bg-white px-8 py-3 text-sm font-bold text-blue-700 shadow-lg hover:bg-blue-50 transition-all hover:shadow-xl"
              >
                JELAJAHI SEKARANG
              </a>
            </div>
          </div>

          {/* Placeholder gambar hero (foto orang / produk) */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-2xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-center text-white/70">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <span className="text-2xl">📸</span>
                  </div>
                  <p className="text-sm font-medium">Foto Hero</p>
                  <p className="text-xs text-white/50 mt-1">Akan ditambahkan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
