/**
 * Script to update product ratings and pricing from JSON file
 * Run: node scripts/update-products-from-json.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Regenerate Prisma client if schema changed
const { execSync } = require('child_process');
console.log('🔄 Regenerating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client regenerated\n');
} catch (e) {
  console.log('⚠️ Prisma generate failed, continuing with existing client\n');
}

const prisma = new PrismaClient();

// Parse harga grosir dari string "Beli (>=10) Rp73.000"
function parseGrosir(grosirString) {
  if (!grosirString) return { minQty: null, harga: null };
  
  // Extract min quantity
  const minMatch = grosirString.match(/>=\s*(\d+)/);
  const minQty = minMatch ? parseInt(minMatch[1]) : null;
  
  // Extract price - remove dots and non-numeric except decimal
  const priceMatch = grosirString.match(/Rp[\s.]*([\d.]+)/);
  let harga = null;
  if (priceMatch) {
    harga = parseInt(priceMatch[1].replace(/\./g, ''));
  }
  
  return { minQty, harga };
}

// Calculate fake original price (30-50% higher than current price)
function calculateHargaAsli(hargaDiskon) {
  // Add 40% to create "fake" discount effect
  return Math.round(hargaDiskon * 1.4 / 1000) * 1000;
}

async function updateProducts() {
  try {
    // Read JSON file
    const jsonPath = path.join(__dirname, '..', '..', 'products_with_shopee_links.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`Found ${jsonData.length} products in JSON`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const item of jsonData) {
      const namaProduk = item['Nama Produk'];
      const rating = item['Rating'] || 0;
      const hargaDiskon = item['Harga'] || 0;
      const grosirString = item['Grosir'];
      
      // Find product by name
      const product = await prisma.product.findFirst({
        where: { nama_produk: namaProduk }
      });
      
      if (!product) {
        console.log(`⚠️  Not found: ${namaProduk}`);
        skipped++;
        continue;
      }
      
      // Parse grosir data
      const { minQty, harga: hargaGrosir } = parseGrosir(grosirString);
      
      // Calculate fake original price
      const hargaAsli = calculateHargaAsli(hargaDiskon);
      
      // Update product
      await prisma.product.update({
        where: { id_product: product.id_product },
        data: {
          rating: Math.round(rating),
          harga_satuan: hargaDiskon,
          harga_asli: hargaAsli,
          harga_grosir: hargaGrosir,
          min_grosir: minQty,
          diskon_persen: Math.round((1 - hargaDiskon/hargaAsli) * 100)
        }
      });
      
      console.log(`✅ Updated: ${namaProduk} | ID: ${product.id_product} | Rating: ${rating}⭐ | Harga: ${hargaAsli.toLocaleString()} → ${hargaDiskon.toLocaleString()} (-${Math.round((1 - hargaDiskon/hargaAsli) * 100)}%) | Grosir: ${minQty}+ @ ${hargaGrosir?.toLocaleString() || '-'}`);
      updated++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProducts();
