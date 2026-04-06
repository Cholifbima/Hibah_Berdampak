const { PrismaClient } = require("@prisma/client");
const data = require("./daftarproduk.json");

const prisma = new PrismaClient();

function parseHarga(str) {
  if (!str || str === "-") return 0;
  return parseInt(str.replace(/[^0-9]/g, ""), 10);
}

/** Stok seragam 99 (pre-order; tidak menampilkan label pre-order di UI). */
const DEFAULT_STOK = 99;

function parseKategori(str) {
  if (!str) return "Umum";
  return str
    .split(/\n|>/)[0]
    .trim()
    .replace(/\s+/g, " ");
}

function parseGrosir(str) {
  if (!str || str.trim() === "-") return [];

  const results = [];
  const regex = /Beli\s*\((?:>=)?(\d+)(?:\s*-\s*\d+)?\)\s*Rp([\d.]+)/gi;
  let match;

  while ((match = regex.exec(str)) !== null) {
    results.push({
      min_qty: parseInt(match[1], 10),
      harga_grosir: parseInt(match[2].replace(/\./g, ""), 10),
    });
  }

  return results;
}

async function main() {
  console.log("Mulai seeding produk...\n");

  for (const item of data) {
    const nama_produk = item["Nama Produk"];
    const deskripsi = item["Deskripsi"] || "-";
    const harga_satuan = parseHarga(item["Harga"]);
    const stok = DEFAULT_STOK;
    const kategori = parseKategori(item["Kategori Produk"]);
    const discounts = parseGrosir(item["Grosir"]);

    const product = await prisma.product.create({
      data: {
        nama_produk,
        deskripsi,
        harga_satuan,
        stok,
        kategori,
        discounts: {
          create: discounts,
        },
      },
    });

    console.log(
      `✓ [${product.id_product}] ${product.nama_produk} — Rp${harga_satuan.toLocaleString("id-ID")} | Stok: ${stok} | Diskon grosir: ${discounts.length}`
    );
  }

  console.log(`\nSelesai! ${data.length} produk berhasil dimasukkan.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
