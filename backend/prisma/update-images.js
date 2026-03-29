const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const IMAGE_MAP = {
  1:  { folder: "TasKeyboard",                         file: "tas_keyboard-1.png" },
  2:  { folder: "TasRanselBeyblade",                   file: "tas_ransel_beyblade-1.png" },
  3:  { folder: "GemstoneBag",                         file: "gemstone_bag-1.png" },
  4:  { folder: "TasSelempang3in1",                    file: "tas_selempang3in1-1.png" },
  5:  { folder: "BoxBayblade",                         file: "box_bayblade-1.png" },
  6:  { folder: "CoverJas",                            file: "cover_jas-1.png" },
  7:  { folder: "TasPedangWushu",                      file: "tas_pedang_wushu-1.png" },
  8:  { folder: "TasPedangTombakWushu",                file: "tas_pedang_tombak_wushu-1.png" },
  9:  { folder: "TasRanselHewan",                      file: "tas_ransel_hewan-1.png" },
  10: { folder: "TasContainerHewan",                   file: "tas_container_hewan-1.png" },
  11: { folder: "TasPancing2Ruang120cm",               file: "tas_pancing_2_ruang_120cm-1.png" },
  12: { folder: "TasPancingSerut2Kantong75cm",         file: "tas_pancing_serut_2_kantong_75cm-1.png" },
  13: { folder: "TasPancing60cm",                      file: "tas_pancing_60cm-1.png" },
  14: { folder: "RodBelt",                             file: "rod_belt-1.png" },
  15: { folder: "TasPancingHardcase120cm",             file: "tas_pancing_hardcase_120cm-1.png" },
  16: { folder: "TasGitarJumbo",                       file: "tas_gitar-1.png" },
  17: { folder: "TasCargoHewan",                       file: "tas_cargo_hewan-1.png" },
  18: { folder: "TasPancingGendong",                   file: "tas_pancing_gendong-1.png" },
  19: { folder: "TasPancing90cm",                      file: "tas_pancing_90cm-1.png" },
  20: { folder: "TasSangkarBurung",                    file: "tas_sangkar_burung-1.png" },
  21: { folder: "TasPancingHardcase100cm",             file: "tas_pancing_hardcase_100cm-1.png" },
  22: { folder: "TasPancingRansel",                    file: "tas_pancing_ransel-1.png" },
  23: { folder: "TasPancingHardcase90cm",              file: "tas_pancing_hardcase_90cm-1.png" },
  24: { folder: "TasPancingTegekPedang120cm",          file: "tas_pancing_tegek_pedang_120cm-1.png" },
  25: { folder: "TaliSelempangL3,8cm",                 file: "tali_tas_selempang1.png" },
  26: { folder: "TasAyamBangkok",                      file: "tas_ayam-1.png" },
  27: { folder: "DauResletingNo5Roll",                 file: "roll_daun_resleting-1.png" },
  28: { folder: "TasJoranLapisBusaAti100cm",           file: "tas_joran_busa-1.png" },
  29: { folder: "CoverGaunPengantin",                  file: "cover_gaunpengantin-1.png" },
  30: { folder: "KaosPolosPremiumCuttonCombed30S",     file: "kaos_polos_premium-1.png" },
  31: { folder: "SandBagMMA",                          file: "sandbag_mma-1.png" },
  32: { folder: "TasSepedaLipat",                      file: "tas_sepeda_lipat-1.png" },
  33: { folder: "PouchMakeUp",                         file: "pouch_makeup-1.png" },
  34: { folder: "TasSepatu",                           file: "tas_sepatu-1.png" },
  35: { folder: "CosmeticBag",                         file: "cosmetic_bag-1.png" },
  36: { folder: "AksesosrisOrganizer",                 file: "acc_organizer-1.png" },
  37: { folder: "CosmeticOrganizer",                   file: "cosmetic_organizer-1.png" },
  38: { folder: "WardrobeOrganizer",                   file: "wardrobe_organizer-1.png" },
  39: { folder: "DompetLebaran",                       file: "dompet_lebaran-1.png" },
  40: { folder: "DompetImlek-DompetAngpao",            file: "dompet_angpao-1.png" },
  41: { folder: "PelindungRantaiSepeda",               file: "pelindung_rantai_sepeda-1.png" },
  46: { folder: "TasPancing2RuangDoreng120cm",         file: "tas_pancing_2_ruang_doreng_120cm-1.png" },
  47: { folder: "TasPancing2RuangDoreng100cm",         file: "tas_pancing_2_ruang_doreng_100cm-1.png" },
  48: { folder: "TasPancingTegekPedangDoreng90cm",     file: "tas_pancing_tegek_pedang_doreng_90cm-1.png" },
  49: { folder: "TasPancing2Ruang100cm",               file: "tas_pancing_2_ruang_100cm-1.png" },
  50: { folder: "TasPancingTegekPedangDoreng100cm",    file: "tas_pancing_tegek_pedang_doreng_100cm-1.png" },
  51: { folder: "TasPancingTegekPedang90cm",           file: "tas_pancing_tegek_pedang_90cm-1.png" },
  52: { folder: "CoverJasTebalBahanSpoonbond",         file: "cover_jas_tebal-1.png" },
  53: { folder: "TasHewanAnjing-Kucing",               file: "tas_hewan-1.png" },
  54: { folder: "TasPancing120cm",                     file: "tas_pancing_120cm-1.png" },
  55: { folder: "TasPancing100cm",                     file: "tas_pancing_100cm-1.png" },
  56: { folder: "TasPancing75cm",                      file: "tas_pancing_75cm-1.png" },
  57: { folder: "TempatMasker",                        file: "dompet_masker-1.png" },
  58: { folder: "TasSadelSepeda",                      file: "tas-sadel-sepeda-1.png" },
  59: { folder: "TasSepedaDouble",                     file: "tas_sepeda_double-1.png" },
  60: { folder: "TasSepedeSegitiga",                   file: "tas_sepeda_segitiga-1.png" },
};

async function main() {
  console.log("Updating gambar_url untuk semua produk...\n");

  for (const [idStr, img] of Object.entries(IMAGE_MAP)) {
    const id = parseInt(idStr);
    const url = `/assets/products/${img.folder}/${img.file}`;

    await prisma.product.update({
      where: { id_product: id },
      data: { gambar_url: url },
    });

    console.log(`  [${id}] => ${url}`);
  }

  console.log(`\nSelesai! ${Object.keys(IMAGE_MAP).length} produk diperbarui.`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
