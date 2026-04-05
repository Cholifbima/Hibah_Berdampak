"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const goTo = (i: number) => {
    if (i < 0) setActiveIndex(images.length - 1);
    else if (i >= images.length) setActiveIndex(0);
    else setActiveIndex(i);
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Gambar utama — min-w-0 mencegah overflow horizontal di grid/flex */}
      <div className="relative aspect-square w-full max-w-full min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#a8d4f5] to-[#6bb3e8]">
        <Image
          src={images[activeIndex]}
          alt={`${productName} - Foto ${activeIndex + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
          className="object-contain p-4 sm:p-6"
          priority
        />

        {hasMultiple && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#163f73] shadow-md hover:bg-white transition-colors sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#163f73] shadow-md hover:bg-white transition-colors sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter */}
        {hasMultiple && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white sm:text-xs">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip — scroll horizontal penuh di mobile + snap */}
      {hasMultiple && (
        <div
          className="mt-3 -mx-4 flex w-full min-w-0 max-w-full touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {images.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl transition-all sm:h-20 sm:w-20 ${
                i === activeIndex
                  ? "ring-2 ring-[#163f73] ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain bg-gradient-to-br from-[#d0e8f8] to-[#b0d4f0] p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
