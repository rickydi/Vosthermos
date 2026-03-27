require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

p.$connect()
  .then(async () => {
    console.log('DB connected OK');
    const tables = await p.$queryRawUnsafe("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log('Tables:', tables.map(t => t.tablename).join(', '));
    const catCount = await p.category.count();
    const prodCount = await p.product.count();
    console.log('Categories:', catCount, '| Products:', prodCount);
    return p.$disconnect();
  })
  .catch(e => { console.log('Error:', e.message); process.exit(1); });
