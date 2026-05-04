const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

// Root health (Passenger / uptime checks)
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'topassist-api', env: NODE_ENV });
});

// ========== AUTH ==========

api.post('/auth/register', async (req, res) => {
  try {
    const { nama_lengkap, username, email, no_whatsapp, password } = req.body;
    if (!nama_lengkap || !username || !password) {
      return res.status(400).json({ error: 'Nama, username, dan password wajib diisi' });
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
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Gagal login dengan Google' });
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

api.post('/orders', authMiddleware, async (req, res) => {
  try {
    const { kode_pesanan, nama_penerima, alamat_pengiriman, no_telepon, catatan, items } = req.body;
    if (!kode_pesanan || !nama_penerima || !alamat_pengiriman || !items?.length)
      return res.status(400).json({ error: 'Data pesanan tidak lengkap' });

    const total = items.reduce((s, i) => s + i.subtotal, 0);

    const order = await prisma.order.create({
      data: {
        id_user: req.userId,
        kode_pesanan,
        total_pembayaran: total,
        nama_penerima,
        alamat_pengiriman,
        no_telepon: no_telepon || '',
        catatan: catatan || '',
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
    res.json(updated);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Gagal mengupdate pesanan' });
  }
});

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.userRole !== 'ADMIN')
      return res.status(403).json({ error: 'Hanya admin yang bisa mengakses' });
    next();
  });
}

api.get('/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const [totalPendapatan, totalProduk, totalStok, totalUser, totalPesanan] = await Promise.all([
      prisma.order.aggregate({ _sum: { total_pembayaran: true } }),
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { stok: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
    ]);
    res.json({
      total_pendapatan: totalPendapatan._sum.total_pembayaran || 0,
      total_produk: totalProduk,
      total_stok: totalStok._sum.stok || 0,
      total_user: totalUser,
      total_pesanan: totalPesanan,
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

app.use('/api', api);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('[topassist] Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[topassist] API listening on port ${PORT} (${NODE_ENV})`);
});
