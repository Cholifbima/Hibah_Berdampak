/**
 * Script untuk sinkronisasi link Shopee (dan Tokopedia/Lazada) dari JSON ke database.
 * Jalankan: node scripts/sync-shopee-links.js
 *
 * Akan mencocokkan berdasarkan nama_produk (case-insensitive).
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.resolve(__dirname, '../../products_with_shopee_links.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File tidak ditemukan:', jsonPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${data.length} produk dari JSON`);

  const products = await prisma.product.findMany();
  console.log(`Database memiliki ${products.length} produk`);

  let updated = 0;
  let skipped = 0;

  for (const item of data) {
    const namaProduk = (item['Nama Produk'] || '').trim();
    const linkShopee = (item['Link Shopee'] || '').trim() || null;
    const linkTokopedia = (item['Link Tokopedia'] || '').trim() || null;
    const linkLazada = (item['Link Lazada'] || '').trim() || null;
    const rating = typeof item['Rating'] === 'number' ? item['Rating'] : 5.0;

    if (!namaProduk) {
      skipped++;
      continue;
    }

    // Cari produk di database berdasarkan nama (case-insensitive)
    const match = products.find(
      (p) => p.nama_produk.toLowerCase().trim() === namaProduk.toLowerCase()
    );

    if (match) {
      await prisma.product.update({
        where: { id_product: match.id_product },
        data: {
          link_shopee: linkShopee,
          link_tokopedia: linkTokopedia,
          link_lazada: linkLazada,
          rating,
        },
      });
      console.log(`✓ Updated: ${match.nama_produk}`);
      updated++;
    } else {
      console.log(`✗ Tidak ditemukan di DB: "${namaProduk}"`);
      skipped++;
    }
  }

  console.log(`\nSelesai! Updated: ${updated}, Skipped/Not found: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
