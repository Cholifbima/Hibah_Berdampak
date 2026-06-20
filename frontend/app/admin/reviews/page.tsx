"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, authFetch } from "@/lib/api";
import { Star, Upload, Trash2, Edit, X, Save, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function AdminReviewsPage() {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For Editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

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

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus ulasan ini?")) return;
    try {
      const res = await authFetch(apiUrl(`/reviews/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id_review !== id));
      } else {
        alert("Gagal menghapus ulasan");
      }
    } catch (error) {
      console.error(error);
      alert("Error menghapus ulasan");
    }
  };

  const handleEditClick = (review: any) => {
    setEditingId(review.id_review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditPreview(review.image_url ? apiUrl(review.image_url) : null);
    setEditImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditImageFile(null);
    setEditPreview(null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      // 1. Update text & rating
      const res = await authFetch(apiUrl(`/reviews/${editingId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      if (!res.ok) throw new Error("Gagal update teks ulasan");
      let updatedReview = await res.json();

      // 2. Update Image if provided
      if (editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);
        const imgRes = await authFetch(apiUrl(`/reviews/${editingId}/image`), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (imgRes.ok) {
          updatedReview = await imgRes.json();
        }
      }

      setReviews(reviews.map((r) => (r.id_review === editingId ? updatedReview : r)));
      handleCancelEdit();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  };

  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return <div className="p-8 text-center text-red-500 font-bold">Akses Ditolak. Khusus Admin.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#163f73]" />
            Kelola Ulasan & Testimoni
          </h1>
          <p className="text-gray-500 text-sm mt-1">Ubah rating, teks, atau tambahkan foto (misal peserta CFD yang lupa upload).</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div key={review.id_review} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-6">
              
              {/* --- VIEW MODE --- */}
              {editingId !== review.id_review ? (
                <>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-800">{review.user?.nama_lengkap}</div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{review.comment}</p>
                    <div className="text-xs text-gray-400 mt-3">
                      {new Date(review.created_at).toLocaleString("id-ID")}
                    </div>
                  </div>
                  
                  {review.image_url ? (
                    <div className="relative w-full md:w-40 h-32 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                      <Image src={apiUrl(review.image_url)} alt="Ulasan" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full md:w-40 h-32 rounded-lg bg-gray-50 flex items-center justify-center border border-dashed border-gray-200 shrink-0">
                      <span className="text-xs text-gray-400">Tidak ada foto</span>
                    </div>
                  )}

                  <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-center">
                    <button onClick={() => handleEditClick(review)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Edit Ulasan / Tambah Foto">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(review.id_review)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Hapus Ulasan">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                /* --- EDIT MODE --- */
                <div className="w-full bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[#163f73]">Edit Ulasan: {review.user?.nama_lengkap}</h3>
                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setEditRating(star)}>
                              <Star className={`w-6 h-6 ${star <= editRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Komentar</label>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-[#163f73] outline-none h-24"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Foto Ulasan</label>
                      <div className="flex items-start gap-4">
                        <label className="cursor-pointer bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
                          <Upload className="w-4 h-4" /> Pilih Foto Baru
                          <input type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                        </label>
                        {editPreview && (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                            <Image src={editPreview} alt="Preview" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        *Admin bisa menambahkan foto jika pelanggan lupa mengunggah saat di booth CFD.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">Batal</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-[#163f73] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#0f2e56]">
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
