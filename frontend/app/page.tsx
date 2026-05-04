"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BestSellingSection from "@/components/BestSellingSection";
import AIConsultantSection from "@/components/AIConsultantSection";
import Footer from "@/components/Footer";
import { fetchBestSelling, type Product } from "@/lib/api";

export default function Home() {
  const [bestSelling, setBestSelling] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchBestSelling()
      .then((data) => {
        if (!cancelled) setBestSelling(data);
      })
      .catch(() => {
        if (!cancelled) setBestSelling([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BestSellingSection products={bestSelling} />
        <AIConsultantSection />
      </main>
      <Footer />
    </>
  );
}
