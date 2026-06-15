const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrder() {
  try {
    const total = 115000;
    const uniqueKode = '#ORD-test-' + Date.now();
    const items = [
      { id_product: 1, kuantitas: 1, harga_satuan_terekam: 115000, subtotal: 115000 }
    ];

    const order = await prisma.order.create({
      data: {
        id_user: 1, // assuming user 1 exists
        kode_pesanan: uniqueKode,
        total_pembayaran: total,
        nama_penerima: 'admin1',
        alamat_pengiriman: 'test',
        no_telepon: '1231',
        catatan: '',
        lat: null,
        lng: null,
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
    console.log('Success:', order.kode_pesanan);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
testOrder();
