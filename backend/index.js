const express = require('express');

const cors = require('cors');

const { PrismaClient } = require('@prisma/client');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

const OpenAI = require('openai').default;

require('dotenv').config();

const webPush = require('web-push');

// Setup VAPID Keys untuk Web Push Notification
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BNx2OMK_wcPmI10wTyyfZMFJIzml9d2kRw5mDUna_G3o2NxGqpMYuiYC9M0Ftf47l7IY7BoQFA9qaOeAEdXsiT0';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'PQiwejGuwrgXFz-W2aKL3HCVzCUJKdBgdow8aJ07jio';
webPush.setVapidDetails(
  'mailto:topassist@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Helper function untuk mengirim notifikasi in-app & push
async function sendNotification(userId, title, message, type = 'INFO', link = null) {
  try {
    // 1. Simpan In-App Notification ke DB
    await prisma.notification.create({
      data: { id_user: userId, title, message, type, link }
    });

    // 2. Ambil Push Subscriptions user tersebut
    const subs = await prisma.pushSubscription.findMany({ where: { id_user: userId } });
    if (subs.length === 0) return;

    // 3. Kirim Web Push ke semua devicenya
    const payload = JSON.stringify({ title, body: message, url: link || '/' });
    
    for (const sub of subs) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      
      try {
        await webPush.sendNotification(pushSubscription, payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription sudah expired / unsubscribed, hapus dari DB
          await prisma.pushSubscription.delete({ where: { id_sub: sub.id_sub } });
        } else {
          console.error('Gagal mengirim Web Push:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error sendNotification:', error);
  }
}

const rateLimitLib = require('express-rate-limit');

// Rate limiter spesifik untuk AI Chat (Mencegah spam token OpenAI)
const chatRateLimiter = rateLimitLib({
  windowMs: 60 * 1000, // 1 menit
  max: 10, // Maksimal 10 kali request per menit dari IP yang sama
  message: { error: 'Terlalu banyak pesan. Mohon tunggu sebentar (1 menit) sebelum bertanya lagi.' },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Simple rate limiting untuk API
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 menit
const RATE_LIMIT_MAX = 30; // 30 request per menit per IP

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const data = requestCounts.get(ip);
  
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (data.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Terlalu banyak request. Coba lagi nanti.' });
  }
  
  data.count++;
  next();
}

// Bersihkan rate limit setiap 10 menit
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 10 * 60 * 1000);



const app = express();

const api = express.Router();

const prisma = new PrismaClient();



const PORT = Number(process.env.PORT) || 5000;

const NODE_ENV = process.env.NODE_ENV || 'development';

const JWT_SECRET = process.env.JWT_SECRET || 'topassist-secret-key-change-in-production';



if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {

  console.warn('[topassist] WARNING: JWT_SECRET tidak di-set di production. Set di cPanel Environment.');

}



app.set('trust proxy', 1);



// ─── Upload folder ──────────────────────────────────────────────────────────

const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });



// Serve uploaded files statically at /api/uploads/*

app.use('/api/uploads', express.static(UPLOADS_DIR));



// Multer storage: preserve extension, unique filename

const storage = multer.diskStorage({

  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),

  filename: (_req, file, cb) => {

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';

    cb(null, `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);

  },

});

const upload = multer({

  storage,

  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB

  fileFilter: (_req, file, cb) => {

    const allowed = /jpeg|jpg|png|webp|gif/;

    if (allowed.test(file.mimetype)) cb(null, true);

    else cb(new Error('Hanya file gambar yang diperbolehkan (jpg, png, webp, gif)'));

  },

});



const corsOrigins = process.env.CORS_ORIGIN

  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)

  : true;



app.use(

  cors({

    origin: corsOrigins,

    credentials: true,

  })

);

app.use(express.json({ limit: '1mb' }));



app.use((req, res, next) => {

  const t = new Date().toISOString();

  console.log(`[${t}] ${req.method} ${req.originalUrl || req.url}`);

  next();

});



function authMiddleware(req, res, next) {

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer '))

    return res.status(401).json({ error: 'Token diperlukan' });

  try {

    const decoded = jwt.verify(header.slice(7), JWT_SECRET);

    req.userId = decoded.id;

    req.userRole = decoded.role;

    next();

  } catch {

    return res.status(401).json({ error: 'Token tidak valid' });

  }

}

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token) {
  if (!token) return false;
  
  // Development mode bypass
  if (token === "dev-mode-token") {
    console.log("[Turnstile] Development mode - bypass verification");
    return true;
  }
  
  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      // Skip verification if no secret key configured (development)
      console.log("[Turnstile] No secret key - skip verification");
      return true;
    }
    
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });
    const data = await response.json();
    
    if (!data.success) {
      console.log("[Turnstile] Verification failed:", data);
    }
    
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}



// Root health (Passenger / uptime checks)


app.get('/', (req, res) => {

  res.json({ ok: true, service: 'topassist-api', env: NODE_ENV });

});



// ========== AUTH ==========



api.post('/auth/register', async (req, res) => {

  try {
    const { nama_lengkap, username, email, no_whatsapp, password, turnstile_token } = req.body;

    if (!nama_lengkap || !username || !password) {
      return res.status(400).json({ error: 'Nama, username, dan password wajib diisi' });
    }

    // Verify Turnstile token (skip if no secret key configured)
    const turnstileValid = await verifyTurnstile(turnstile_token);
    if (!turnstileValid) {
      return res.status(400).json({ error: 'Verifikasi keamanan gagal. Silakan refresh halaman dan coba lagi.' });
    }

    const existing = await prisma.user.findFirst({

      where: { OR: [{ username }, ...(email ? [{ email }] : [])] },

    });

    if (existing) return res.status(409).json({ error: 'Username atau email sudah terdaftar' });



    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nama_lengkap, username, email: email || null, no_whatsapp: no_whatsapp || '', password: hashed },
    });

    const token = jwt.sign({ id: user.id_user, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        no_whatsapp: user.no_whatsapp,
        alamat: user.alamat,
        lat: user.lat,
        lng: user.lng,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Gagal membuat akun' });
  }
});

api.post('/auth/login', async (req, res) => {

  try {

    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });



    const user = await prisma.user.findFirst({

      where: { OR: [{ username }, { email: username }] },

    });

    if (!user) return res.status(401).json({ error: 'Username atau password salah' });



    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: 'Username atau password salah' });



    const token = jwt.sign({ id: user.id_user, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        no_whatsapp: user.no_whatsapp,
        alamat: user.alamat,
        lat: user.lat,
        lng: user.lng,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Gagal login' });

  }

});



api.post('/auth/google', async (req, res) => {

  try {

    const { google_id, email, name } = req.body;

    if (!google_id || !email) return res.status(400).json({ error: 'Data Google tidak lengkap' });



    const emailNorm = String(email).trim().toLowerCase();

    const emailRaw = String(email).trim();



    let user = await prisma.user.findUnique({ where: { google_id } });

    if (!user) {

      user = await prisma.user.findFirst({

        where: {

          OR: [

            { email: emailNorm },

            { email: emailRaw },

          ],

        },

      });

    }



    if (!user) {

      const username = emailNorm.split('@')[0] + '_' + Date.now().toString(36);

      user = await prisma.user.create({

        data: {

          nama_lengkap: name || emailNorm,

          username,

          email: emailNorm,

          google_id,

          password: '',

          no_whatsapp: '',

        },

      });

    } else {

      const patch = {};

      if (!user.google_id) patch.google_id = google_id;

      if (user.email && user.email !== emailNorm) patch.email = emailNorm;

      else if (!user.email) patch.email = emailNorm;

      if (Object.keys(patch).length) {

        user = await prisma.user.update({ where: { id_user: user.id_user }, data: patch });

      }

    }



    const token = jwt.sign({ id: user.id_user, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        no_whatsapp: user.no_whatsapp,
        alamat: user.alamat,
        lat: user.lat,
        lng: user.lng,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Gagal login dengan Google' });

  }

});

// ─── Token Verify & Refresh ─────────────────────────────────────────────────
// Verify: cek apakah token masih valid, return user data terbaru dari DB
api.get('/auth/verify', async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token diperlukan' });

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    // Ambil data user terbaru dari database
    const user = await prisma.user.findUnique({ where: { id_user: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });

    res.json({
      valid: true,
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        no_whatsapp: user.no_whatsapp,
        alamat: user.alamat,
        lat: user.lat,
        lng: user.lng,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (err) {
    // Token expired atau tidak valid
    return res.status(401).json({ error: 'Token tidak valid atau sudah expired' });
  }
});

// Refresh: issue token baru jika token lama masih valid ATAU baru expired < 24 jam
api.post('/auth/refresh', async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token diperlukan' });

  const rawToken = header.slice(7);

  try {
    // Coba verify dulu (token masih valid)
    const decoded = jwt.verify(rawToken, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id_user: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });

    // Issue token baru
    const newToken = jwt.sign(
      { id: user.id_user, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token: newToken,
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        no_whatsapp: user.no_whatsapp,
        alamat: user.alamat,
        lat: user.lat,
        lng: user.lng,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (err) {
    // Token expired — cek apakah masih dalam grace period 24 jam
    if (err.name === 'TokenExpiredError') {
      try {
        const decoded = jwt.decode(rawToken);
        if (!decoded || !decoded.id) return res.status(401).json({ error: 'Token tidak valid' });

        // Grace period: 24 jam setelah expired
        const expiredAt = (decoded.exp || 0) * 1000;
        const gracePeriod = 24 * 60 * 60 * 1000; // 24 jam
        if (Date.now() - expiredAt > gracePeriod) {
          return res.status(401).json({ error: 'Token sudah expired terlalu lama, silakan login ulang' });
        }

        const user = await prisma.user.findUnique({ where: { id_user: decoded.id } });
        if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });

        const newToken = jwt.sign(
          { id: user.id_user, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          token: newToken,
          user: {
            id_user: user.id_user,
            nama_lengkap: user.nama_lengkap,
            username: user.username,
            email: user.email,
            no_whatsapp: user.no_whatsapp,
            alamat: user.alamat,
            lat: user.lat,
            lng: user.lng,
            avatar_url: user.avatar_url,
            role: user.role,
          },
        });
      } catch {
        return res.status(401).json({ error: 'Token tidak valid' });
      }
    }
    return res.status(401).json({ error: 'Token tidak valid' });
  }
});



function mapCartRows(rows) {

  return rows.map((r) => ({

    id_product: r.product.id_product,

    nama_produk: r.product.nama_produk,

    harga_satuan: r.product.harga_satuan,

    gambar_url: r.product.gambar_url,

    qty: r.qty,

    discounts: r.product.discounts,

  }));

}



api.get('/cart', authMiddleware, async (req, res) => {

  try {

    const rows = await prisma.cartItem.findMany({

      where: { id_user: req.userId },

      include: { product: { include: { discounts: true } } },

    });

    res.json(mapCartRows(rows));

  } catch (error) {

    console.error('Get cart error:', error);

    res.status(500).json({ error: 'Gagal memuat keranjang' });

  }

});



api.put('/cart', authMiddleware, async (req, res) => {

  try {

    const { items } = req.body;

    if (!Array.isArray(items)) return res.status(400).json({ error: 'items harus array' });

    const valid = items.filter((i) => i.id_product && i.qty > 0);

    if (valid.length) {

      const ids = [...new Set(valid.map((i) => i.id_product))];

      const products = await prisma.product.findMany({ where: { id_product: { in: ids } } });

      if (products.length !== ids.length) return res.status(400).json({ error: 'Produk tidak valid' });

    }

    await prisma.$transaction(async (tx) => {

      await tx.cartItem.deleteMany({ where: { id_user: req.userId } });

      if (valid.length) {

        await tx.cartItem.createMany({

          data: valid.map((i) => ({

            id_user: req.userId,

            id_product: i.id_product,

            qty: i.qty,

          })),

        });

      }

    });

    const rows = await prisma.cartItem.findMany({

      where: { id_user: req.userId },

      include: { product: { include: { discounts: true } } },

    });

    res.json(mapCartRows(rows));

  } catch (error) {

    console.error('Put cart error:', error);

    res.status(500).json({ error: 'Gagal menyimpan keranjang' });

  }

});



api.get('/products', async (req, res) => {

  try {

    const products = await prisma.product.findMany({

      include: { discounts: true },

      orderBy: { id_product: 'asc' },

    });

    res.json(products);

  } catch (error) {

    console.error('Gagal ambil produk:', error);

    res.status(500).json({ error: 'Gagal mengambil data produk' });

  }

});



api.get('/products/best-selling', async (req, res) => {

  try {

    const products = await prisma.product.findMany({

      where: { stok: { gt: 0 } },

      include: { discounts: true },

      orderBy: { id_product: 'asc' },

      take: 4,

    });

    res.json(products);

  } catch (error) {

    console.error('Gagal ambil best selling:', error);

    res.status(500).json({ error: 'Gagal mengambil data produk' });

  }

});



api.get('/products/categories', async (req, res) => {

  try {

    const products = await prisma.product.findMany({

      where: { nama_produk: { not: '' } },

      select: { kategori: true },

    });

    const categories = [...new Set(products.map((p) => p.kategori))].filter(Boolean).sort();

    res.json(categories);

  } catch (error) {

    console.error('Gagal ambil kategori:', error);

    res.status(500).json({ error: 'Gagal mengambil kategori' });

  }

});



api.get('/products/:id', async (req, res) => {

  try {

    const product = await prisma.product.findUnique({

      where: { id_product: parseInt(req.params.id) },

      include: { discounts: true },

    });

    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });

    res.json(product);

  } catch (error) {

    console.error('Gagal ambil detail produk:', error);

    res.status(500).json({ error: 'Gagal mengambil detail produk' });

  }

});



// ─── Product CRUD (admin only) ───────────────────────────────────────────────

api.post('/products', adminMiddleware, async (req, res) => {

  try {

    const { nama_produk, deskripsi, harga_satuan, stok, gambar_url, kategori, link_shopee, link_tokopedia, link_lazada, link_tiktok } = req.body;

    if (!nama_produk || harga_satuan == null || stok == null) {

      return res.status(400).json({ error: 'Nama produk, harga, dan stok wajib diisi' });

    }

    const product = await prisma.product.create({

      data: {

        nama_produk,

        deskripsi: deskripsi || '',

        harga_satuan: Number(harga_satuan),

        stok: Number(stok),

        gambar_url: gambar_url || null,

        kategori: kategori || '',

        link_shopee: link_shopee || null,

        link_tokopedia: link_tokopedia || null,

        link_lazada: link_lazada || null,

        link_tiktok: link_tiktok || null,

      },

      include: { discounts: true },

    });

    res.json(product);

  } catch (error) {

    console.error('Create product error:', error);

    res.status(500).json({ error: 'Gagal membuat produk' });

  }

});



api.put('/products/:id', adminMiddleware, async (req, res) => {

  try {

    const id = parseInt(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id_product: id } });

    if (!existing) return res.status(404).json({ error: 'Produk tidak ditemukan' });

    const { nama_produk, deskripsi, harga_satuan, stok, gambar_url, kategori, link_shopee, link_tokopedia, link_lazada, link_tiktok } = req.body;

    const product = await prisma.product.update({

      where: { id_product: id },

      data: {

        ...(nama_produk !== undefined && { nama_produk }),

        ...(deskripsi !== undefined && { deskripsi }),

        ...(harga_satuan !== undefined && { harga_satuan: Number(harga_satuan) }),

        ...(stok !== undefined && { stok: Number(stok) }),

        ...(gambar_url !== undefined && { gambar_url: gambar_url || null }),

        ...(kategori !== undefined && { kategori }),

        ...(link_shopee !== undefined && { link_shopee: link_shopee || null }),

        ...(link_tokopedia !== undefined && { link_tokopedia: link_tokopedia || null }),

        ...(link_lazada !== undefined && { link_lazada: link_lazada || null }),

        ...(link_tiktok !== undefined && { link_tiktok: link_tiktok || null }),

      },

      include: { discounts: true },

    });

    res.json(product);

  } catch (error) {

    console.error('Update product error:', error);

    res.status(500).json({ error: 'Gagal mengupdate produk' });

  }

});



api.delete('/products/:id', adminMiddleware, async (req, res) => {

  try {

    const id = parseInt(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id_product: id } });

    if (!existing) return res.status(404).json({ error: 'Produk tidak ditemukan' });



    await prisma.product.delete({ where: { id_product: id } });

    res.json({ success: true, id_product: id });

  } catch (error) {

    console.error('Delete product error:', error);

    res.status(500).json({ error: 'Gagal menghapus produk' });

  }

});



api.post('/orders', authMiddleware, async (req, res) => {
  try {
    const { nama_penerima, alamat_pengiriman, no_telepon, catatan, lat, lng, items } = req.body;

    if (!nama_penerima || !alamat_pengiriman || !items?.length)
      return res.status(400).json({ error: 'Data pesanan tidak lengkap' });

    const total = items.reduce((s, i) => s + i.subtotal, 0);
    const todayDate = new Date();
    const yyyy = todayDate.getFullYear();
    const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(todayDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const startOfDay = new Date(todayDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(todayDate.setHours(23, 59, 59, 999));

    const todayOrderCount = await prisma.order.count({
      where: {
        tanggal_pesanan: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const sequence = String(todayOrderCount + 1).padStart(4, '0');
    const uniqueKode = `ORD-${dateStr}-${sequence}`;

    const order = await prisma.order.create({
      data: {
        id_user: req.userId,
        kode_pesanan: uniqueKode,
        total_pembayaran: total,
        nama_penerima,
        alamat_pengiriman,
        no_telepon: no_telepon || '',
        catatan: catatan || '',
        lat: lat || null,
        lng: lng || null,
        details: {
          create: items.map((i) => ({
            id_product: i.id_product,
            kuantitas: i.kuantitas,
            harga_satuan_terekam: i.harga_satuan_terekam,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { details: { include: { product: true } } },
    });

    res.json(order);

  } catch (error) {

    console.error('Create order error:', error);

    res.status(500).json({ error: 'Gagal membuat pesanan' });

  }

});



api.get('/orders/me', authMiddleware, async (req, res) => {

  try {

    const orders = await prisma.order.findMany({

      where: { id_user: req.userId },

      include: { details: { include: { product: true } } },

      orderBy: { tanggal_pesanan: 'desc' },

    });

    res.json(orders);

  } catch (error) {

    console.error('Get orders error:', error);

    res.status(500).json({ error: 'Gagal mengambil pesanan' });

  }

});



// Endpoint upload bukti pembayaran
api.post('/orders/:id/upload-bukti', authMiddleware, upload.single('bukti'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' });

    const order = await prisma.order.findUnique({ where: { id_order: orderId } });
    if (!order) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    if (order.id_user !== req.userId && req.userRole !== 'ADMIN') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    await prisma.order.update({
      where: { id_order: orderId },
      data: { 
        bukti_pembayaran_url: fileUrl,
        status_pesanan: 'MENUNGGU_KONFIRMASI'
      }
    });

    // --- Notifikasi WA ke Owner ---
    try {
      const ownerNumber = process.env.OWNER_WA_NUMBER || '08157799036'; // Ganti dengan nomor asli owner
      const waBotUrl = process.env.WA_BOT_URL || 'http://127.0.0.1:3001';
      const waBotSecret = process.env.WA_BOT_SECRET || 'topassist_rahasia_123';
      
      const message = `Halo Admin/Owner TopAssist! 📦\n\nAda transaksi baru yang menunggu konfirmasi pembayaran.\n\n` +
                      `🛒 *Kode Pesanan:* ${order.kode_pesanan}\n` +
                      `👤 *Pembeli:* ${order.nama_penerima}\n` +
                      `💰 *Total Tagihan:* Rp${order.total_pembayaran.toLocaleString('id-ID')}\n\n` +
                      `Pembeli sudah mengunggah bukti pembayaran. Segera cek mutasi rekening Anda dan periksa halaman Dasbor Admin TopAssist untuk memproses pesanan ini.\n\n` +
                      `- _Sistem Otomatis TopAssist_`;

      // Kirim tanpa harus menunggu fetch selesai (fire and forget) agar response tidak delay
      fetch(`${waBotUrl}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: waBotSecret, number: ownerNumber, message })
      }).catch(e => console.error("WA Bot Error:", e.message));
    } catch (waErr) {
      console.error("Gagal mengirim notif WA ke Owner", waErr);
    }
    // ------------------------------

    // --- Notifikasi Web Push + In-App ke Admin ---
    try {
      const adminUsers = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of adminUsers) {
        await sendNotification(
          admin.id_user,
          "Bukti Pembayaran Baru 💰",
          `Pembeli ${order.nama_penerima} mengunggah bukti pembayaran untuk pesanan ${order.kode_pesanan}.`,
          "ORDER",
          `/admin/pesanan`
        );
      }
    } catch (err) { console.error(err); }
    // ---------------------------------

    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload bukti error:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Gagal mengupload bukti pembayaran' });
  }
});

api.get('/orders/:id', authMiddleware, async (req, res) => {

  try {

    const order = await prisma.order.findUnique({

      where: { id_order: parseInt(req.params.id) },

      include: { details: { include: { product: true } }, user: { select: { nama_lengkap: true, username: true } } },

    });

    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    if (order.id_user !== req.userId && req.userRole !== 'ADMIN')

      return res.status(403).json({ error: 'Akses ditolak' });

    res.json(order);

  } catch (error) {

    console.error('Get order detail error:', error);

    res.status(500).json({ error: 'Gagal mengambil detail pesanan' });

  }

});



// Konfigurasi BinderByte API Keys (Round Robin)
// Jika di server Domainesia (cPanel Node.js App), tambahkan Environment Variable:
// Name: BINDERBYTE_API_KEY
// Value: api_key_anda_1,api_key_anda_2
const envKeys = process.env.BINDERBYTE_API_KEY 
  ? process.env.BINDERBYTE_API_KEY.split(',').map(k => k.trim()).filter(Boolean)
  : [];

const BINDERBYTE_API_KEYS = envKeys.length > 0 ? envKeys : [
  'ISI_API_KEY_BINDERBYTE_ANDA_DISINI', // Fallback jika .env belum diisi
];
let currentBinderByteIndex = 0;

api.get('/orders/:id/track', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id_order: parseInt(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    
    if (order.id_user !== req.userId && req.userRole !== 'ADMIN')
      return res.status(403).json({ error: 'Akses ditolak' });

    if (!order.nomor_resi || !order.jenis_pengiriman) {
      return res.status(400).json({ error: 'Nomor resi atau kurir belum tersedia' });
    }

    // Periksa apakah API keys sudah diatur
    if (BINDERBYTE_API_KEYS.length === 0 || BINDERBYTE_API_KEYS[0].includes('ISI_API_KEY_BINDERBYTE_ANDA_DISINI')) {
      return res.status(500).json({ error: 'API Key BinderByte belum dikonfigurasi di backend/index.js' });
    }

    const apiKey = BINDERBYTE_API_KEYS[currentBinderByteIndex];
    currentBinderByteIndex = (currentBinderByteIndex + 1) % BINDERBYTE_API_KEYS.length;

    const response = await fetch(`https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${order.jenis_pengiriman.toLowerCase()}&awb=${order.nomor_resi}`);
    const data = await response.json();

    if (data.status !== 200) {
      return res.status(400).json({ error: data.message || 'Gagal melacak resi' });
    }

    res.json(data);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Gagal menghubungi server pelacakan' });
  }
});

api.get('/track', authMiddleware, async (req, res) => {
  try {
    const { courier, awb } = req.query;
    if (!courier || !awb) return res.status(400).json({ error: 'Kurir dan nomor resi harus diisi' });

    if (BINDERBYTE_API_KEYS.length === 0 || BINDERBYTE_API_KEYS[0].includes('ISI_API_KEY_BINDERBYTE_ANDA_DISINI')) {
      return res.status(500).json({ error: 'API Key BinderByte belum dikonfigurasi di backend/index.js' });
    }

    const apiKey = BINDERBYTE_API_KEYS[currentBinderByteIndex];
    currentBinderByteIndex = (currentBinderByteIndex + 1) % BINDERBYTE_API_KEYS.length;

    const response = await fetch(`https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${courier.toLowerCase()}&awb=${awb}`);
    const data = await response.json();

    if (data.status !== 200) {
      return res.status(400).json({ error: data.message || 'Gagal melacak resi' });
    }

    res.json(data);
  } catch (error) {
    console.error('Manual tracking error:', error);
    res.status(500).json({ error: 'Gagal menghubungi server pelacakan' });
  }
});

api.patch('/orders/:id/status', authMiddleware, async (req, res) => {

  try {

    const { status_pesanan, jenis_pengiriman, nomor_resi } = req.body;

    const order = await prisma.order.findUnique({ where: { id_order: parseInt(req.params.id) } });

    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    if (order.id_user !== req.userId && req.userRole !== 'ADMIN')

      return res.status(403).json({ error: 'Akses ditolak' });



    const data = {};

    if (status_pesanan) data.status_pesanan = status_pesanan;

    if (jenis_pengiriman !== undefined) data.jenis_pengiriman = jenis_pengiriman;

    if (nomor_resi !== undefined) data.nomor_resi = nomor_resi;



    const updated = await prisma.order.update({
      where: { id_order: parseInt(req.params.id) },
      data,
      include: { details: { include: { product: true } } },
    });

    // --- Pengurangan Stok saat status menjadi SELESAI ---
    if (order.status_pesanan !== 'SELESAI' && status_pesanan === 'SELESAI') {
      try {
        await prisma.$transaction(
          updated.details.map((detail) => 
            prisma.product.update({
              where: { id_product: detail.id_product },
              data: { stok: { decrement: detail.kuantitas } }
            })
          )
        );
      } catch (err) {
        console.error("Gagal mengurangi stok produk:", err);
      }
    }

    // --- Notifikasi Web Push + In-App ke Pembeli ---
    if (status_pesanan === 'DIKIRIM' && updated.nomor_resi) {
      await sendNotification(
        updated.id_user,
        "Pesanan Dikirim! 📦",
        `Pesanan ${updated.kode_pesanan} sedang dalam perjalanan via ${updated.jenis_pengiriman}. Resi: ${updated.nomor_resi}`,
        "SHIPPING",
        `/pesanan/detail?id=${updated.id_order}`
      );
    } else if (status_pesanan === 'DIKONFIRMASI') {
      await sendNotification(
        updated.id_user,
        "Pembayaran Diterima ✅",
        `Pembayaran pesanan ${updated.kode_pesanan} telah dikonfirmasi dan pesanan sedang disiapkan.`,
        "ORDER",
        `/pesanan/detail?id=${updated.id_order}`
      );
    }
    // ---------------------------------

    // --- Notifikasi WA ke Pembeli ---
    if (status_pesanan === 'DIKIRIM' && updated.nomor_resi && updated.no_telepon) {
      try {
        const waBotUrl = process.env.WA_BOT_URL || 'http://127.0.0.1:3001';
        const waBotSecret = process.env.WA_BOT_SECRET || 'topassist_rahasia_123';
        
        const message = `Halo ${updated.nama_penerima}! 🎉\n\n` +
                        `Kabar gembira! Pesanan Anda dengan kode *${updated.kode_pesanan}* sedang dalam perjalanan.\n\n` +
                        `🚚 *Jasa Pengiriman:* ${updated.jenis_pengiriman?.toUpperCase() || 'Kurir'}\n` +
                        `📦 *Nomor Resi:* ${updated.nomor_resi}\n\n` +
                        `Anda bisa melacak paket secara real-time langsung melalui website TopAssist.\n` +
                        `Terima kasih telah berbelanja di TopAssist! 😊`;

        fetch(`${waBotUrl}/api/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secretKey: waBotSecret, number: updated.no_telepon, message })
        }).catch(e => console.error("WA Bot Error:", e.message));
      } catch (waErr) {
        console.error("Gagal mengirim notif WA ke Pembeli", waErr);
      }
    }
    // ---------------------------------

    res.json(updated);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Gagal mengupdate pesanan' });
  }
});

// Admin hapus pesanan
api.delete('/orders/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.userRole || req.userRole.toUpperCase() !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak' });
    
    // Hapus detail pesanan terlebih dahulu (karena ada foreign key constraint)
    await prisma.orderDetail.deleteMany({ where: { id_order: parseInt(req.params.id) } });
    
    // Baru hapus pesanan utama
    await prisma.order.delete({ where: { id_order: parseInt(req.params.id) } });
    
    res.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Gagal menghapus pesanan' });
  }
});



function adminMiddleware(req, res, next) {

  authMiddleware(req, res, () => {

    if (req.userRole !== 'ADMIN')

      return res.status(403).json({ error: 'Hanya admin yang bisa mengakses' });

    next();

  });

}



// ─── Notifications API ──────────────────────────────────────────────────────
api.post('/notifications/subscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Data subscription tidak valid' });
    }

    // Upsert subscription
    const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });
    if (existing) {
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: { id_user: req.userId, p256dh: keys.p256dh, auth: keys.auth }
      });
    } else {
      await prisma.pushSubscription.create({
        data: { id_user: req.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Push Subscribe error:', error);
    res.status(500).json({ error: 'Gagal subscribe notifikasi' });
  }
});

api.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { id_user: req.userId },
      orderBy: { created_at: 'desc' },
      take: 20
    });
    res.json(notifs);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Gagal mengambil notifikasi' });
  }
});

api.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.notification.updateMany({
      where: { id_notification: id, id_user: req.userId },
      data: { is_read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membaca notifikasi' });
  }
});
// ────────────────────────────────────────────────────────────────────────────

api.get('/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const [totalPendapatan, totalProduk, totalStok, totalUser, totalPesanan] = await Promise.all([
      prisma.order.aggregate({ 
        _sum: { total_pembayaran: true },
        where: { status_pesanan: 'SELESAI' }
      }),
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { stok: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
    ]);

    // Hitung data grafik 6 bulan terakhir
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: { 
        tanggal_pesanan: { gte: sixMonthsAgo },
        status_pesanan: 'SELESAI'
      },
      select: { tanggal_pesanan: true, total_pembayaran: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const chartDataMap = {};
    
    // Inisialisasi 6 bulan terakhir dengan 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      chartDataMap[mName] = 0;
    }

    recentOrders.forEach(o => {
      const mName = monthNames[new Date(o.tanggal_pesanan).getMonth()];
      if (chartDataMap[mName] !== undefined) {
        chartDataMap[mName] += o.total_pembayaran;
      }
    });

    const chartData = Object.keys(chartDataMap).map(k => ({ name: k, pendapatan: chartDataMap[k] }));

    // Ambil log aktivitas terbaru (5 pesanan terakhir)
    const latestOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      include: { user: { select: { nama_lengkap: true } } }
    });

    const recentActivity = latestOrders.map(o => ({
      id: o.id_order,
      pesan: `Pesanan ${o.kode_pesanan} diupdate menjadi ${o.status_pesanan}`,
      waktu: o.updated_at
    }));

    res.json({
      total_pendapatan: totalPendapatan._sum.total_pembayaran || 0,
      total_produk: totalProduk,
      total_stok: totalStok._sum.stok || 0,
      total_user: totalUser,
      total_pesanan: totalPesanan,
      chartData,
      recentActivity
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
});



api.get('/admin/tren-penjualan', adminMiddleware, async (req, res) => {

  try {

    const details = await prisma.orderDetail.groupBy({

      by: ['id_product'],

      _sum: { kuantitas: true, subtotal: true },

      orderBy: { _sum: { kuantitas: 'desc' } },

      take: 10,

    });

    const ids = details.map((d) => d.id_product);

    const products = await prisma.product.findMany({ where: { id_product: { in: ids } } });

    const map = Object.fromEntries(products.map((p) => [p.id_product, p]));

    const result = details.map((d) => ({

      id_product: d.id_product,

      nama_produk: map[d.id_product]?.nama_produk ?? '-',

      gambar_url: map[d.id_product]?.gambar_url ?? null,

      harga_satuan: map[d.id_product]?.harga_satuan ?? 0,

      stok: map[d.id_product]?.stok ?? 0,

      total_terjual: d._sum.kuantitas || 0,

      total_pendapatan: d._sum.subtotal || 0,

    }));

    res.json(result);

  } catch (error) {

    console.error('Tren penjualan error:', error);

    res.status(500).json({ error: 'Gagal mengambil tren penjualan' });

  }

});



api.get('/admin/orders', adminMiddleware, async (req, res) => {

  try {

    const orders = await prisma.order.findMany({

      include: {

        details: { include: { product: true } },

        user: { select: { nama_lengkap: true, username: true, email: true } },

      },

      orderBy: { tanggal_pesanan: 'desc' },

    });

    res.json(orders);

  } catch (error) {

    console.error('Admin orders error:', error);

    res.status(500).json({ error: 'Gagal mengambil pesanan' });

  }

});



api.get('/admin/products', adminMiddleware, async (req, res) => {

  try {

    const products = await prisma.product.findMany({

      include: { discounts: true },

      orderBy: { id_product: 'asc' },

    });

    res.json(products);

  } catch (error) {

    console.error('Admin products error:', error);

    res.status(500).json({ error: 'Gagal mengambil produk' });

  }

});



api.get('/admin/users', adminMiddleware, async (req, res) => {

  try {

    const users = await prisma.user.findMany({

      select: {

        id_user: true, nama_lengkap: true, username: true,

        email: true, no_whatsapp: true, role: true, created_at: true,

      },

      orderBy: { created_at: 'desc' },

    });

    res.json(users);

  } catch (error) {

    console.error('Admin users error:', error);

    res.status(500).json({ error: 'Gagal mengambil data user' });

  }

});

api.delete('/admin/users/:id', adminMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: 'ID tidak valid' });

    // Cek apakah user mencoba menghapus dirinya sendiri
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id_user: userId } });
    if (!userToDelete) return res.status(404).json({ error: 'User tidak ditemukan' });

    // Hapus OrderDetail dan Order terkait
    const userOrders = await prisma.order.findMany({ where: { id_user: userId }, select: { id_order: true } });
    const orderIds = userOrders.map(o => o.id_order);
    if (orderIds.length > 0) {
      await prisma.orderDetail.deleteMany({ where: { id_order: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id_order: { in: orderIds } } });
    }

    // Hapus CartItem (otomatis karena Cascade) dan User
    await prisma.user.delete({ where: { id_user: userId } });

    res.json({ success: true, message: 'User beserta datanya berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
});

// ─── Profile ─────────────────────────────────────────────────────────────────
api.get('/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id_user: req.userId },
      select: {
        id_user: true, nama_lengkap: true, username: true,
        email: true, no_whatsapp: true, role: true, avatar_url: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Gagal memuat profil' });
  }
});

api.put('/users/me', authMiddleware, async (req, res) => {
  try {
    const { nama_lengkap, email, no_whatsapp, avatar_url, alamat, lat, lng } = req.body;
    const data = {};
    if (nama_lengkap !== undefined) data.nama_lengkap = typeof nama_lengkap === 'string' ? nama_lengkap.trim() : '';
    if (email !== undefined) data.email = typeof email === 'string' && email.trim() !== '' ? email.trim() : null;
    if (no_whatsapp !== undefined) data.no_whatsapp = typeof no_whatsapp === 'string' ? no_whatsapp.trim() : '';
    if (avatar_url !== undefined) data.avatar_url = avatar_url || null;
    if (alamat !== undefined) data.alamat = typeof alamat === 'string' && alamat.trim() !== '' ? alamat.trim() : null;
    if (lat !== undefined) data.lat = lat === null ? null : parseFloat(lat);
    if (lng !== undefined) data.lng = lng === null ? null : parseFloat(lng);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diubah' });
    }

    const user = await prisma.user.update({
      where: { id_user: req.userId },
      data,
      select: {
        id_user: true, nama_lengkap: true, username: true,
        email: true, no_whatsapp: true, alamat: true, lat: true, lng: true,
        role: true, avatar_url: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Gagal update profil' });
  }
});

api.put('/users/me/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Password lama dan baru wajib diisi' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    const user = await prisma.user.findUnique({ where: { id_user: req.userId } });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ error: 'Password lama salah' });

    const hashed = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { id_user: req.userId },
      data: { password: hashed },
    });
    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

// ─── AI Chat ─────────────────────────────────────────────────────────────────

const openai = process.env.OPENAI_API_KEY

  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  : null;



api.post('/chat', chatRateLimiter, async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Ambil pesan terakhir user
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content?.toLowerCase() || '';

    // Ambil produk dari DB
    const products = await prisma.product.findMany({
      where: { stok: { gt: 0 } },
      select: {
        id_product: true,
        nama_produk: true,
        kategori: true,
        harga_satuan: true,
        stok: true,
        discounts: { select: { min_qty: true, harga_grosir: true } },
      },
      orderBy: { nama_produk: 'asc' },
    });

    // SMART FALLBACK: Jika OpenAI tidak tersedia, gunakan keyword matching
    if (!openai) {
      const keywords = lastUserMessage.split(/\s+/);
      
      // Cari produk yang match dengan keyword
      const matchedProducts = products.filter(p => {
        const nama = p.nama_produk.toLowerCase();
        const kategori = (p.kategori || '').toLowerCase();
        return keywords.some(k => 
          nama.includes(k) || 
          kategori.includes(k) ||
          k.includes('tas') && nama.includes('tas')
        );
      }).slice(0, 4);

      // Generate respons sederhana
      let reply = '';
      
      if (lastUserMessage.includes('halo') || lastUserMessage.includes('hi') || lastUserMessage.includes('hello')) {
        reply = `Halo! 👋 Selamat datang di TopAssist!\n\nSaya bisa membantu kamu mencari produk tas berkualitas. Kami punya berbagai pilihan:\n\n`;
        products.slice(0, 4).forEach(p => {
          reply += `• [ID:${p.id_product}] ${p.nama_produk} - Rp${p.harga_satuan.toLocaleString('id-ID')}\n`;
        });
        reply += `\nTanyakan produk spesifik atau kategori yang kamu cari ya!`;
      } else if (lastUserMessage.includes('murah') || lastUserMessage.includes('termurah')) {
        const cheapest = [...products].sort((a, b) => a.harga_satuan - b.harga_satuan).slice(0, 3);
        reply = `Berikut produk dengan harga terbaik dari kami:\n\n`;
        cheapest.forEach(p => {
          reply += `• [ID:${p.id_product}] ${p.nama_produk} - **Rp${p.harga_satuan.toLocaleString('id-ID')}**\n`;
        });
        reply += `\nMau lihat yang lain? Coba tanyakan "tas pancing" atau "tas olahraga"!`;
      } else if (lastUserMessage.includes('pancing')) {
        const pancing = products.filter(p => p.nama_produk.toLowerCase().includes('pancing')).slice(0, 3);
        if (pancing.length > 0) {
          reply = `Kami punya beberapa tas pancing keren nih:\n\n`;
          pancing.forEach(p => {
            reply += `• [ID:${p.id_product}] ${p.nama_produk} - Rp${p.harga_satuan.toLocaleString('id-ID')}\n`;
          });
        } else {
          reply = `Maaf, saat ini stok tas pancing sedang habis. Coba lihat produk lain seperti tas olahraga atau tas multifungsi ya!`;
        }
      } else if (lastUserMessage.includes('grosir') || lastUserMessage.includes('diskon') || lastUserMessage.includes('murah banyak')) {
        const grosirProducts = products.filter(p => p.discounts.length > 0).slice(0, 4);
        if (grosirProducts.length > 0) {
          reply = `Yuk, cek promo grosir kami! 🎉\n\n`;
          grosirProducts.forEach(p => {
            const disc = p.discounts[0];
            reply += `• [ID:${p.id_product}] ${p.nama_produk}\n  Beli ${disc.min_qty} pcs cuma **Rp${disc.harga_grosir.toLocaleString('id-ID')}**/pcs\n\n`;
          });
        } else {
          reply = `Saat ini belum ada promo grosir aktif. Tetap pantau ya, nanti bakal ada promo menarik! 😊`;
        }
      } else if (matchedProducts.length > 0) {
        reply = `Berikut rekomendasi produk untuk kamu:\n\n`;
        matchedProducts.forEach(p => {
          reply += `• [ID:${p.id_product}] ${p.nama_produk}\n  Harga: Rp${p.harga_satuan.toLocaleString('id-ID')}\n`;
          if (p.discounts.length > 0) {
            reply += `  🏷️ Grosir: Beli ${p.discounts[0].min_qty}+ pcs = Rp${p.discounts[0].harga_grosir.toLocaleString('id-ID')}/pcs\n`;
          }
          reply += `\n`;
        });
        reply += `Mau tanya detail produk tertentu? Langsung klik aja produknya! 😉`;
      } else {
        reply = `Maaf, saya tidak menemukan produk yang cocok dengan "${lastUserMessage}".\n\nKami punya **${products.length} produk** siap kirim!\n\nCoba tanyakan:\n• "tas pancing"\n• "tas olahraga"\n• "produk murah"\n• "promo grosir"\n\nAtau chat WhatsApp untuk custom order! 😊`;
      }

      return res.json({ reply, products: matchedProducts });
    }

    // OpenAI tersedia - gunakan AI
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Maaf, terjadi kesalahan. Silakan refresh halaman dan coba lagi.' });
    }

    // Ambil produk dari DB (hanya field yang diperlukan untuk hemat token)
    const aiProducts = await prisma.product.findMany({
      where: { stok: { gt: 0 } },

      select: {

        id_product: true,

        nama_produk: true,

        kategori: true,

        harga_satuan: true,

        stok: true,

        discounts: { select: { min_qty: true, harga_grosir: true } },

      },

      orderBy: { nama_produk: 'asc' },

    });



    // Buat katalog ringkas untuk system prompt (hemat token)
    const catalog = aiProducts
      .filter((p) => p.nama_produk.trim())
      .map((p) => {
        const harga = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.harga_satuan);
        const grosir = p.discounts.length > 0
          ? ` | Grosir: beli >=${p.discounts[0].min_qty} pcs = ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.discounts[0].harga_grosir)}/pcs`
          : '';
        return `- [ID:${p.id_product}] ${p.nama_produk} | Kategori: ${p.kategori || '-'} | Harga: ${harga} | Stok: ${p.stok}${grosir}`;
      })
      .join('\n');



    const systemPrompt = `Kamu adalah Konsultan AI profesional untuk TopAssist (juga dikenal sebagai Top Production), sebuah pabrik konveksi tas, tas seminar, tas custom, dan produk konveksi lainnya yang berkualitas.
Kamu sangat pintar, ramah, dan solutif layaknya konsultan bisnis. Kamu bukan hanya merekomendasikan produk, tapi juga bisa menjawab pertanyaan FAQ dan berdiskusi soal custom order.

INFO PENTING (FAQ & KONTAK):
- Alamat Toko/Pabrik: SAMPING (selatan) KEBUGARAN SOLO & SPA, PAGER MERAH ada POHON MANGGA, Jl. Mojo No.18A, Karangasem, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57145.
- Jam Operasional: Senin - Sabtu (10.00 - 17.00 WIB). Hari Minggu & Tanggal Merah tetap ada pengiriman.
- WhatsApp Admin: 0815-7799-036
- Layanan Kami: Menjual tas eceran, grosir (harga lebih murah), dan melayani custom order tas konveksi untuk seminar/instansi.

KATALOG PRODUK:
${catalog}

ATURAN MENJAWAB:
1. Jawab dalam Bahasa Indonesia yang ramah, sopan, dan profesional. Gunakan emoji sewajarnya.
2. Jika pengguna bertanya tentang alamat, jam buka, atau kontak, berikan informasinya dengan jelas.
3. Jika pengguna menanyakan rekomendasi produk, berikan 2-4 produk yang paling relevan dari katalog.
4. JIKA MEREKOMENDASIKAN PRODUK, FORMATNYA WAJIB SEPERTI INI (di baris baru):
   [ID:123] **Nama Produk** - Harga: **Rp50.000** (Grosir: **Rp45.000**)
   (Sertakan [ID:xxx] persis di awal agar sistem bisa memunculkan kartu produk yang bisa diklik user)
5. Jika pengguna mencari produk yang tidak ada di katalog, beri tahu bahwa kami melayani "Custom Order" melalui WhatsApp.
6. Berikan jawaban yang natural, informatif, dan tidak kaku. Jangan menolak menjawab pertanyaan umum seputar konveksi, bahan tas, atau pengiriman.
7. Usahakan ringkas namun padat (sekitar maksimal 250 kata).`;

    // Ambil maksimal 10 pesan terakhir untuk hemat token
    const recentMessages = messages.slice(-10);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });



    const reply = completion.choices[0]?.message?.content || 'Maaf, terjadi kesalahan. Coba lagi ya!';



    // Ekstrak ID produk yang disebutkan AI dari format [ID:xxx]

    const mentionedIds = [...reply.matchAll(/\[ID:(\d+)\]/g)].map((m) => parseInt(m[1]));

    const mentionedProducts = mentionedIds.length > 0

      ? await prisma.product.findMany({

          where: { id_product: { in: mentionedIds } },

          include: { discounts: true },

        })

      : [];



    // Bersihkan tag [ID:xxx] dari teks balasan agar tidak tampil ke user

    const cleanReply = reply.replace(/\[ID:\d+\]/g, '').replace(/\s{2,}/g, ' ').trim();



    res.json({ reply: cleanReply, products: mentionedProducts });

  } catch (error) {
    console.error('[chat] Error:', error?.message || error);
    res.status(500).json({ error: 'Maaf, tidak bisa terhubung ke server. Coba lagi nanti.' });
  }
});



// ─── Image Upload ────────────────────────────────────────────────────────────

api.post('/upload-image', authMiddleware, upload.single('image'), (req, res) => {

  if (!req.file) return res.status(400).json({ error: 'File gambar tidak ditemukan' });

  const baseUrl = process.env.BASE_URL?.replace(/\/$/, '')

    || `${req.protocol}://${req.get('host')}`;

  const fileUrl = `${baseUrl}/api/uploads/${req.file.filename}`;

  res.json({ url: fileUrl, filename: req.file.filename });

});



// Error handler untuk multer (ukuran file dll)

api.use((err, req, res, next) => {

  if (err instanceof multer.MulterError || err.message?.includes('gambar')) {

    return res.status(400).json({ error: err.message });

  }

  next(err);

});



// Health check for Passenger
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'topassist-api', env: NODE_ENV });
});

app.use('/api', api);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });

});



app.use((err, req, res, next) => {

  console.error('[topassist] Unhandled error:', err);

  if (res.headersSent) return next(err);

  res.status(500).json({ error: 'Internal server error' });

});



// Export for Passenger (Node.js Selector)
module.exports = app;

// Only listen directly if not running under Passenger (development)
if (!process.env.PASSENGER_APP_GROUP_NAME) {
  app.listen(PORT, () => {
    console.log(`[topassist] API listening on port ${PORT} (${NODE_ENV})`);
  });
}

