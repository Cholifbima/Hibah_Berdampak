# TopAssist — Website E-commerce

Repo ini isinya **frontend** (Next.js) dan **backend** (Express + Prisma + MySQL). Dua folder itu dijalankan terpisah saat development.

## Yang perlu dipasang dulu

Lihat `requirements.txt` di folder yang sama. Intinya: **Node.js 20+**, **npm**, dan **Git**. Database MySQL bisa pakai layanan cloud (mis. Aiven) atau lokal, yang penting connection string-nya masuk ke `.env` backend.

## Ambil kode dari GitHub

```bash
git clone https://github.com/Cholifbima/Hibah_Berdampak.git
cd Hibah_Berdampak
```

Kalau sudah pernah clone, cukup update:

```bash
git pull origin ui-design
```

(Branch utama development kami biasanya `ui-design`; kalau beda, ganti nama branch-nya.)

## Setup backend

```bash
cd backend
npm install
```

Buat file **`backend/.env`** (jangan di-commit). Isi minimal:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/NAMA_DB?sslaccept=strict"
JWT_SECRET=isi_string_rahasia_bebas
PORT=5000
```

Lalu sinkronkan skema ke database dan generate client Prisma:

```bash
npx prisma generate
npx prisma db push
```

Kalau perlu data awal produk:

```bash
npx prisma db seed
```

Jalankan API:

```bash
npm run dev
```

Backend biasanya di **http://localhost:5000**.

## Setup frontend

Buka terminal baru:

```bash
cd frontend
npm install
```

Buat file **`frontend/.env.local`**:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=isi_dari_Google_Cloud_kalau_pakai_login_Google
```

`NEXT_PUBLIC_GOOGLE_CLIENT_ID` boleh kosong dulu kalau fitur Google login belum dipakai.

Jalankan:

```bash
npm run dev
```

Buka **http://localhost:3000**.

## Ringkasannya

Dua terminal: satu `backend` (`npm run dev`), satu `frontend` (`npm run dev`). Pastikan `.env` dan `.env.local` sudah benar; file itu **tidak** ikut push ke GitHub (sudah di `.gitignore`).
