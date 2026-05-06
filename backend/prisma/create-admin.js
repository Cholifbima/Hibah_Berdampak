const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "admin123";
  const email    = "admin@topkonveksi.com";
  const nama     = "Admin TopAssist";

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existing) {
    // Kalau sudah ada, upgrade role-nya saja
    const updated = await prisma.user.update({
      where: { id_user: existing.id_user },
      data: { role: "ADMIN" },
    });
    console.log(`✓ User sudah ada. Role diupdate ke ADMIN.`);
    console.log(`  Username : ${updated.username}`);
    console.log(`  Email    : ${updated.email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      nama_lengkap: nama,
      username,
      email,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log(`✓ Akun admin berhasil dibuat!`);
  console.log(`  Nama     : ${user.nama_lengkap}`);
  console.log(`  Username : ${user.username}`);
  console.log(`  Email    : ${user.email}`);
  console.log(`  Password : ${password}`);
  console.log(`  Role     : ${user.role}`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
