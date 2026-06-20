"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, authFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, Upload, MessageCircle, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default function ReviewsPage() {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(apiUrl("/reviews"));
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat ulasan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      alert("Silakan login terlebih dahulu untuk memberikan ulasan.");
      return;
    }
    if (!comment.trim()) {
      alert("Komentar tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Buat Review
      const res = await authFetch(apiUrl("/reviews"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan ulasan");
      const reviewData = await res.json();

      // 2. Upload Gambar jika ada
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await authFetch(apiUrl(`/reviews/${reviewData.id_review}/image`), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      alert("Terima kasih atas ulasan Anda!");
      setRating(5);
      setComment("");
      setImageFile(null);
      setPreview(null);
      fetchReviews();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 mt-16 sm:mt-24">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#163f73] mb-3">Apa Kata Mereka?</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Terima kasih telah mengunjungi booth kami di CFD! Bagikan pengalaman Anda dan lihat apa kata pelanggan lainnya tentang produk TopAssist.
          </p>
        </div>

        {/* --- Form Ulasan --- */}
        {user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tulis Ulasan Anda</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Penilaian Anda</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bagikan Pengalaman Anda</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Bagaimana kualitas produk dan pelayanan kami?"
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#163f73] focus:ring-1 focus:ring-[#163f73] outline-none min-h-[100px]"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Foto (Opsional)</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium w-full sm:w-auto">
                    <Upload className="w-4 h-4" />
                    Pilih Foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {preview && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#163f73] text-white rounded-xl font-bold text-sm hover:bg-[#0f2e56] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">Ingin membagikan pengalaman Anda?</h2>
            <p className="text-gray-500 mb-5 text-sm">Silakan login untuk memberikan bintang dan ulasan.</p>
            <a href="/auth/login?redirect=/reviews" className="inline-block px-6 py-2.5 bg-[#163f73] text-white rounded-xl font-bold text-sm hover:bg-[#0f2e56] transition-colors">
              Login Sekarang
            </a>
          </div>
        )}

        {/* --- List Ulasan --- */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ulasan Terbaru</h2>
          {loading ? (
            <div className="text-center py-10 text-gray-500">Memuat ulasan...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
              Belum ada ulasan. Jadilah yang pertama!
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {reviews.map((review) => (
                <div key={review.id_review} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {review.user?.avatar_url ? (
                        <Image src={apiUrl(review.user.avatar_url)} alt={review.user.nama_lengkap} width={40} height={40} className="object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{review.user?.nama_lengkap || "Pengguna Anonim"}</h4>
                      <div className="flex text-yellow-400 text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) + " " + new Date(review.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 flex-1 whitespace-pre-wrap">{review.comment}</p>
                  
                  {review.image_url && (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden mt-auto border border-gray-100">
                      <Image src={apiUrl(review.image_url)} alt="Foto Ulasan" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
