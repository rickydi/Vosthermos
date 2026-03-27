require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Subcategory definitions based on old 4319.ca site
// Each entry: parent slug -> array of { name, slug, keywords (matched against product name, case-insensitive) }
const SUBCATEGORIES = {
  'fenetres-battant': [
    { name: 'Opérateurs', slug: 'battant-operateurs', keywords: ['opérateur', 'operateur'] },
    { name: 'Poignées', slug: 'battant-poignees', keywords: ['poignée', 'poignee'] },
    { name: 'Charnières', slug: 'battant-charnieres', keywords: ['charnière', 'charniere'] },
    { name: 'Barrures', slug: 'battant-barrures', keywords: ['barrure', 'loquet', 'verrou'] },
    { name: 'Autres', slug: 'battant-autres', keywords: [] }, // catch-all
  ],
  'fenetres-guillotine': [
    { name: 'Balances à cordes', slug: 'guillotine-balances', keywords: ['balance', 'corde'] },
    { name: 'Spirales', slug: 'guillotine-spirales', keywords: ['spirale', 'spiral'] },
    { name: 'Barrures', slug: 'guillotine-barrures', keywords: ['barrure', 'loquet', 'verrou'] },
    { name: 'Sabots et pivots', slug: 'guillotine-sabots', keywords: ['sabot', 'pivot'] },
    { name: 'Autres', slug: 'guillotine-autres', keywords: [] },
  ],
  'portes-patio': [
    { name: 'Roulettes', slug: 'patio-roulettes', keywords: ['roulette', 'roulement'] },
    { name: 'Barrures', slug: 'patio-barrures', keywords: ['barrure', 'loquet', 'verrou', 'crochet'] },
    { name: 'Poignées', slug: 'patio-poignees', keywords: ['poignée', 'poignee', 'gâche', 'gache'] },
    { name: 'Autres', slug: 'patio-autres', keywords: [] },
  ],
  'portes-patio-poignees': [
    // This whole category IS poignées, no need for subcats - merge into portes-patio/poignees
  ],
  'moustiquaires': [
    { name: 'Fabrication', slug: 'moustiquaire-fabrication', keywords: ['moustiquaire', 'fabrication', 'toile'] },
    { name: 'Rouleaux', slug: 'moustiquaire-rouleaux', keywords: ['rouleau'] },
    { name: 'Bourrelets', slug: 'moustiquaire-bourrelets', keywords: ['bourrelet', 'spline'] },
    { name: 'Autres', slug: 'moustiquaire-autres', keywords: [] },
  ],
  'coupe-froids': [
    { name: 'Portes résidentielles', slug: 'cf-residentielles', keywords: ['résidentiel', 'residentiel', 'porte'] },
    { name: 'Portes commerciales', slug: 'cf-commerciales', keywords: ['commercial'] },
    { name: 'Fenêtres', slug: 'cf-fenetres', keywords: ['fenêtre', 'fenetre'] },
    { name: 'Seuils et balais', slug: 'cf-seuils', keywords: ['seuil', 'balai'] },
    { name: 'Autocollants', slug: 'cf-autocollants', keywords: ['autocollant', 'adhésif', 'adhesif'] },
    { name: 'Autres', slug: 'cf-autres', keywords: [] },
  ],
  'portes-residentielles': [
    { name: 'Coupe-froids', slug: 'residentielle-coupefroids', keywords: ['coupe-froid', 'coupe froid'] },
    { name: 'Balais et seuils', slug: 'residentielle-balais', keywords: ['balai', 'seuil'] },
    { name: 'Accessoires', slug: 'residentielle-accessoires', keywords: [] },
  ],
  'portes-commerciales': [
    { name: 'Charnières', slug: 'commerciale-charnieres', keywords: ['charnière', 'charniere'] },
    { name: 'Ferme-portes', slug: 'commerciale-fermeportes', keywords: ['ferme-porte', 'ferme porte'] },
    { name: 'Barrures', slug: 'commerciale-barrures', keywords: ['barrure', 'loquet', 'verrou'] },
    { name: 'Coupe-froids', slug: 'commerciale-coupefroids', keywords: ['coupe-froid', 'coupe froid'] },
    { name: 'Accessoires', slug: 'commerciale-accessoires', keywords: [] },
  ],
};

// Categories that go directly to products (no subcats)
const NO_SUBCATS = ['douches', 'garde-robes', 'autres'];

function matchSubcategory(productName, subcats) {
  const nameLower = productName.toLowerCase();
  for (const sub of subcats) {
    if (sub.keywords.length === 0) continue; // skip catch-all
    for (const kw of sub.keywords) {
      if (nameLower.includes(kw.toLowerCase())) return sub;
    }
  }
  // Return catch-all (last with empty keywords, or null)
  const catchAll = subcats.find(s => s.keywords.length === 0);
  return catchAll || null;
}

async function main() {
  console.log('=== ADDING SUBCATEGORIES ===\n');

  // First, merge "Portes patio - Poignées" into "Portes patio"
  const patioCat = await prisma.category.findUnique({ where: { slug: 'portes-patio' } });
  const patioPoigneesCat = await prisma.category.findUnique({ where: { slug: 'portes-patio-poignees' } });

  if (patioCat && patioPoigneesCat) {
    console.log(`Merging "Portes patio - Poignées" (${patioPoigneesCat.id}) into "Portes patio" (${patioCat.id})...`);
    await prisma.product.updateMany({
      where: { categoryId: patioPoigneesCat.id },
      data: { categoryId: patioCat.id },
    });
    await prisma.category.delete({ where: { id: patioPoigneesCat.id } });
    console.log('  Done - merged and deleted.\n');
  }

  // Now create subcategories and reassign products
  let totalMoved = 0;

  for (const [parentSlug, subcats] of Object.entries(SUBCATEGORIES)) {
    if (subcats.length === 0) continue;

    const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
    if (!parent) {
      console.log(`SKIP: Parent "${parentSlug}" not found`);
      continue;
    }

    console.log(`\n--- ${parent.name} (${parentSlug}) ---`);

    // Get all products in this parent category
    const products = await prisma.product.findMany({
      where: { categoryId: parent.id },
    });
    console.log(`  ${products.length} products to classify`);

    // Create subcategories
    const subCatIds = {};
    let subOrder = 0;
    for (const sub of subcats) {
      const existing = await prisma.category.findUnique({ where: { slug: sub.slug } });
      if (existing) {
        subCatIds[sub.slug] = existing.id;
        console.log(`  [exists] ${sub.name} (${sub.slug}) id=${existing.id}`);
      } else {
        const created = await prisma.category.create({
          data: {
            name: sub.name,
            slug: sub.slug,
            parentId: parent.id,
            order: subOrder++,
          },
        });
        subCatIds[sub.slug] = created.id;
        console.log(`  [created] ${sub.name} (${sub.slug}) id=${created.id}`);
      }
    }

    // Assign products to subcategories
    const stats = {};
    for (const product of products) {
      const matched = matchSubcategory(product.name, subcats);
      if (matched) {
        const newCatId = subCatIds[matched.slug];
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: newCatId },
        });
        stats[matched.name] = (stats[matched.name] || 0) + 1;
        totalMoved++;
      }
    }

    for (const [name, count] of Object.entries(stats)) {
      console.log(`    -> ${name}: ${count} products`);
    }
  }

  console.log(`\n=== DONE === ${totalMoved} products reassigned to subcategories`);

  // Verify
  console.log('\n=== CATEGORY TREE ===');
  const allCats = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: { include: { _count: { select: { products: true } } } },
    },
    where: { parentId: null },
    orderBy: { order: 'asc' },
  });

  for (const cat of allCats) {
    const childProducts = cat.children.reduce((sum, c) => sum + c._count.products, 0);
    const directProducts = cat._count.products;
    console.log(`${cat.name}: ${directProducts} direct, ${childProducts} in subcats`);
    for (const child of cat.children) {
      console.log(`  └─ ${child.name}: ${child._count.products} products`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
