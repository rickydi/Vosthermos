require('dotenv/config');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const JSON_FILE = 'C:/Users/info/Downloads/vosthermos_products_final.json';
const IMAGES_DIR = 'C:/Users/info/Downloads/vosthermos_images';
const DEST_DIR = path.join(__dirname, '..', 'public', 'uploads', 'products');

// Category mapping by SKU prefix
const CATEGORY_MAP = {
  'DEF5': { name: 'Fenêtres à battant', slug: 'fenetres-battant', subcategories: {
    'operateur': 'Opérateurs',
    'poign': 'Poignées',
    'charni': 'Charnières',
    'barru': 'Barrures',
  }},
  'DEF3': { name: 'Fenêtres à guillotine', slug: 'fenetres-guillotine' },
  'DEF7': { name: 'Fenêtres coulissantes', slug: 'fenetres-coulissantes' },
  'DEF1': { name: 'Portes patio', slug: 'portes-patio' },
  'DEF2': { name: 'Portes patio - Poignées', slug: 'portes-patio-poignees' },
  'DEF4': { name: 'Moustiquaires', slug: 'moustiquaires' },
  'DEF6': { name: 'Coupe-froids', slug: 'coupe-froids' },
  'DEF8': { name: 'Portes résidentielles', slug: 'portes-residentielles' },
  'DEF9': { name: 'Douches', slug: 'douches' },
  'DEF10': { name: 'Garde-robes', slug: 'garde-robes' },
  'DEF11': { name: 'Portes commerciales', slug: 'portes-commerciales' },
  'DEF12': { name: 'Contre-portes', slug: 'contre-portes' },
  'DEF13': { name: 'Fenêtres à auvent', slug: 'fenetres-auvent' },
};

function sanitizeSku(sku) {
  return sku.replace(/&quot;/g, '').replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_').trim();
}

function slugify(text) {
  return text
    .replace(/&quot;/g, '')
    .replace(/&amp;/g, '')
    .replace(/&nbsp;/g, '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}

function getCategoryPrefix(sku) {
  const clean = sku.replace(/&quot;/g, '');
  // Try DEF10, DEF11, etc first (2 digits)
  const match2 = clean.match(/^(DEF\d{2})/i);
  if (match2 && CATEGORY_MAP[match2[1].toUpperCase()]) return match2[1].toUpperCase();
  // Then single digit
  const match1 = clean.match(/^(DEF\d)/i);
  if (match1 && CATEGORY_MAP[match1[1].toUpperCase()]) return match1[1].toUpperCase();
  return null;
}

async function main() {
  console.log('=== IMPORT VOSTHERMOS PRODUCTS ===\n');

  // Read products
  const products = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  console.log(`Loaded ${products.length} products from JSON\n`);

  // Create destination directory
  if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

  // Clear existing data
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('Cleared existing data\n');

  // Create categories
  console.log('Creating categories...');
  const categoryIds = {};
  let catOrder = 0;
  for (const [prefix, info] of Object.entries(CATEGORY_MAP)) {
    const cat = await prisma.category.create({
      data: { name: info.name, slug: info.slug, order: catOrder++ }
    });
    categoryIds[prefix] = cat.id;
    console.log(`  [${prefix}] ${info.name} (id: ${cat.id})`);
  }

  // Also create "Autres" category for unmatched
  const autresCat = await prisma.category.create({
    data: { name: 'Autres', slug: 'autres', order: catOrder++ }
  });
  console.log(`  [???] Autres (id: ${autresCat.id})\n`);

  // Import products
  console.log('Importing products...');
  let imported = 0;
  let imgCopied = 0;
  let imgMissing = 0;
  const errors = [];
  const usedSlugs = new Set();

  for (const p of products) {
    try {
      const cleanSku = sanitizeSku(p.sku);
      let slug = slugify(p.sku);

      // Ensure unique slug
      if (usedSlugs.has(slug)) {
        slug = slug + '-' + p.import_id.replace(/[^a-z0-9-]/g, '');
      }
      usedSlugs.add(slug);

      // Determine category
      const prefix = getCategoryPrefix(p.sku);
      const categoryId = prefix ? categoryIds[prefix] : autresCat.id;

      // Clean description HTML entities
      const name = (p.description || p.sku)
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

      const detailedDesc = (p.detailedDescription || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');

      // Copy images
      const skuDir = path.join(IMAGES_DIR, cleanSku);
      const destSkuDir = path.join(DEST_DIR, cleanSku);
      const imageRecords = [];

      if (fs.existsSync(skuDir)) {
        if (!fs.existsSync(destSkuDir)) fs.mkdirSync(destSkuDir, { recursive: true });

        const imgFiles = fs.readdirSync(skuDir).filter(f => f.endsWith('.jpg'));
        imgFiles.sort(); // Ensure consistent order

        for (let i = 0; i < imgFiles.length; i++) {
          const src = path.join(skuDir, imgFiles[i]);
          const dest = path.join(destSkuDir, imgFiles[i]);

          if (!fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
          }

          imageRecords.push({
            url: `/uploads/products/${cleanSku}/${imgFiles[i]}`,
            position: i,
          });
          imgCopied++;
        }
      } else {
        imgMissing++;
      }

      // Create product with images
      await prisma.product.create({
        data: {
          sku: p.sku.replace(/&quot;/g, '"'),
          name,
          description: name,
          detailedDescription: detailedDesc || null,
          price: parseFloat(p.price),
          slug,
          availability: p.availability === 'https://schema.org/InStock' ? 'InStock' : (p.availability || 'InStock'),
          categoryId,
          images: {
            create: imageRecords,
          },
        },
      });

      imported++;
      if (imported % 50 === 0) {
        process.stdout.write(`\r  ${imported}/${products.length} imported...`);
      }
    } catch (e) {
      errors.push({ sku: p.sku, error: e.message });
    }
  }

  console.log(`\r  ${imported}/${products.length} imported!      \n`);

  // Verification
  console.log('=== VERIFICATION ===');
  const dbProducts = await prisma.product.count();
  const dbImages = await prisma.productImage.count();
  const dbCategories = await prisma.category.count();

  console.log(`DB Products: ${dbProducts} (expected: ${products.length})`);
  console.log(`DB Images: ${dbImages} (copied: ${imgCopied})`);
  console.log(`DB Categories: ${dbCategories}`);
  console.log(`Image folders missing: ${imgMissing}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nERRORS:');
    errors.forEach(e => console.log(`  ${e.sku}: ${e.error}`));
  }

  // Verify SKU-image integrity
  console.log('\n=== SKU-IMAGE INTEGRITY CHECK ===');
  const allProducts = await prisma.product.findMany({ include: { images: true } });
  let integrityOk = 0;
  let integrityFail = 0;

  for (const prod of allProducts) {
    for (const img of prod.images) {
      const fullPath = path.join(__dirname, '..', 'public', img.url);
      if (fs.existsSync(fullPath)) {
        integrityOk++;
      } else {
        integrityFail++;
        console.log(`  MISSING: ${prod.sku} -> ${img.url}`);
      }
    }
  }

  console.log(`Images verified: ${integrityOk} OK, ${integrityFail} MISSING`);

  // Category distribution
  console.log('\n=== CATEGORY DISTRIBUTION ===');
  const cats = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { order: 'asc' },
  });
  for (const c of cats) {
    console.log(`  ${c.name}: ${c._count.products} products`);
  }

  console.log('\nDone!');
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
