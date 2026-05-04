/**
 * Satu kali / ulang: set semua produk stok = 99 (pre-order tanpa label sold out).
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    data: { stok: 99 },
  });
  console.log(`Selesai: ${result.count} produk di-set stok = 99.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
