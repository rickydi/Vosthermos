require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function normalizePhoneDigits(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? digits : null;
}
function formatPhone(phone) {
  const d = normalizePhoneDigits(phone);
  return d ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : null;
}
function normalizeEmail(email) {
  if (!email) return null;
  const t = String(email).trim().toLowerCase();
  return t || null;
}
function pickFilled(existing, next) {
  if (next === undefined || next === null || next === '') return existing;
  return existing && String(existing).trim() ? existing : next;
}

async function upsertClient({ name, phone, email, address, city, notes, source }) {
  const cleanName = name?.trim() || null;
  const cleanEmail = normalizeEmail(email);
  const phoneDigits = normalizePhoneDigits(phone);
  const cleanPhone = formatPhone(phone);
  if (!cleanName && !cleanEmail && !cleanPhone) return { skipped: true };

  let existing = null;
  if (cleanEmail) {
    existing = await prisma.client.findUnique({ where: { email: cleanEmail } });
  }
  if (!existing && phoneDigits) {
    existing = await prisma.client.findFirst({
      where: { phone: { contains: phoneDigits.slice(-7) } },
    });
  }

  const sourceNote = source ? `[auto: ${source} backfill]` : null;

  if (existing) {
    await prisma.client.update({
      where: { id: existing.id },
      data: {
        name: pickFilled(existing.name, cleanName) || existing.name,
        email: existing.email || cleanEmail,
        phone: pickFilled(existing.phone, cleanPhone),
        address: pickFilled(existing.address, address),
        city: pickFilled(existing.city, city),
        notes: existing.notes || [sourceNote, notes].filter(Boolean).join('\n') || null,
      },
    });
    return { updated: true };
  }

  await prisma.client.create({
    data: {
      name: cleanName || 'Sans nom',
      email: cleanEmail,
      phone: cleanPhone,
      address: address?.trim() || null,
      city: city?.trim() || null,
      notes: [sourceNote, notes].filter(Boolean).join('\n') || null,
    },
  });
  return { created: true };
}

async function main() {
  let createdChat = 0, updatedChat = 0, createdRdv = 0, updatedRdv = 0;

  const chats = await prisma.chatConversation.findMany();
  console.log(`[backfill] ${chats.length} chats`);
  for (const c of chats) {
    const res = await upsertClient({
      name: c.clientName, phone: c.clientPhone, email: c.clientEmail, source: 'chat',
    });
    if (res.created) createdChat++;
    else if (res.updated) updatedChat++;
  }

  const rdvs = await prisma.appointment.findMany();
  console.log(`[backfill] ${rdvs.length} rendez-vous`);
  for (const r of rdvs) {
    const res = await upsertClient({
      name: r.name, phone: r.phone, email: r.email,
      address: r.address, city: r.city,
      notes: r.notes ? `Service: ${r.serviceType}\n${r.notes}` : `Service: ${r.serviceType}`,
      source: 'rendez-vous',
    });
    if (res.created) createdRdv++;
    else if (res.updated) updatedRdv++;
  }

  const total = await prisma.client.count();
  console.log(`[backfill] chat: +${createdChat} crees, ${updatedChat} maj`);
  console.log(`[backfill] rdv:  +${createdRdv} crees, ${updatedRdv} maj`);
  console.log(`[backfill] total clients en BD: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
