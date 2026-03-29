const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Halo! Server Top Production sudah menyala" });
});

app.get('/api/products', async (req, res) => {
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

app.get('/api/products/best-selling', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { stok: { gt: 0 } },
      include: { discounts: true },
      orderBy: { id_product: 'asc' },
      take: 3,
    });
    res.json(products);
  } catch (error) {
    console.error('Gagal ambil best selling:', error);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});