# TopAssist — Website E-commerce

Repo ini isinya **frontend** (Next.js) dan **backend** (Express + Prisma + MySQL). Dua folder itu dijalankan terpisah saat development.

## Yang perlu dipasang dulu

Baca `requirements.txt`: itu **hanya** daftar program di PC (Node, Git, dll). **Daftar library npm** ada di `backend/package.json` dan `frontend/package.json` — versi terkunci lewat `package-lock.json`.

## Ambil kode dari GitHub

```bash
git clone https://github.com/Cholifbima/Hibah_Berdampak.git
cd Hibah_Berdampak
```

Kalau sudah pernah clone, cukup update:

```bash
git pull origin master
```

(Branch utama development kami biasanya `ui-design`; kalau beda, ganti nama branch-nya.)

## Install semua dependency npm (satu perintah)

Di **folder root** repo (bukan di dalam `backend`/`frontend`):

```bash
npm run install:all
```

Ini menjalankan `npm install` di `backend` dan `frontend` berurutan. Setelah itu `node_modules` di kedua folder sudah terisi; tidak perlu `npm install` manual dua kali kecuali mau update paket.

## Setup backend

Kalau sudah `npm run install:all`, langkah `npm install` di bawah bisa dilewati.

```bash
cd backend
```

Buat file **`backend/.env`** (jangan di-commit). Isi minimal:

```.env
DATABASE_URL="cek wa grup"
```

Lalu sinkronkan skema ke database dan generate client Prisma:

```bash
npx prisma generate
npx prisma db push
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
```

(`npm install` di sini tidak perlu jika sudah `npm run install:all` di root.)

Buat file **`frontend/.env.local`**:

```.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=cek wa grup
```

Jalankan:

```bash
npm run dev
```

Buka **http://localhost:3000**.

## Ringkasannya

Dua terminal: satu `backend` (`npm run dev`), satu `frontend` (`npm run dev`). Pastikan `.env` dan `.env.local` sudah benar; file itu **tidak** ikut push ke GitHub (sudah di `.gitignore`).
