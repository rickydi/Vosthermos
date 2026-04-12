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

function fmtDateTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function buildChatBlock(conv, messages) {
  const lines = [];
  lines.push(`=== CHAT (${fmtDateTime(conv.createdAt)}) ===`);
  lines.push(`Nom: ${conv.clientName}`);
  lines.push(`Tel: ${conv.clientPhone}`);
  if (conv.clientEmail) lines.push(`Email: ${conv.clientEmail}`);
  lines.push(`Messages: ${messages.length}`);
  if (messages.length === 0) {
    lines.push('(aucun message)');
  } else {
    for (const m of messages) {
      const who = m.senderName || m.senderType || '?';
      const content = m.content || (m.imageUrl ? `[image] ${m.imageUrl}` : '');
      lines.push(`[${fmtDateTime(m.createdAt)}] ${who}: ${content}`);
    }
  }
  return lines.join('\n');
}

function buildRdvBlock(r) {
  const lines = [];
  lines.push(`=== RENDEZ-VOUS (${fmtDateTime(r.createdAt)}) ===`);
  lines.push(`Service: ${r.serviceType}`);
  lines.push(`Date: ${fmtDate(r.date)} ${r.timeSlot || ''}`.trim());
  if (r.address) lines.push(`Adresse: ${r.address}`);
  if (r.city) lines.push(`Ville: ${r.city}`);
  lines.push(`Statut: ${r.status}`);
  if (r.notes) lines.push(`Notes: ${r.notes}`);
  return lines.join('\n');
}

function isStubNotes(notes) {
  if (!notes) return true;
  return /^\[auto:[^\]]*\]\s*$/.test(notes.trim());
}

async function findExisting({ email, phoneDigits }) {
  if (email) {
    const byEmail = await prisma.client.findUnique({ where: { email } });
    if (byEmail) return byEmail;
  }
  if (phoneDigits) {
    return await prisma.client.findFirst({
      where: { phone: { contains: phoneDigits.slice(-7) } },
    });
  }
  return null;
}

async function mergeInto({ existing, name, email, phone, address, city, block }) {
  let base = isStubNotes(existing.notes) ? '' : (existing.notes || '').trim();
  if (base.includes(block.split('\n')[0])) return { skipped: true };
  const merged = base ? `${base}\n\n${block}` : block;
  await prisma.client.update({
    where: { id: existing.id },
    data: {
      name: existing.name || name,
      email: existing.email || email,
      phone: existing.phone || phone,
      address: existing.address || address || null,
      city: existing.city || city || null,
      notes: merged,
    },
  });
  return { updated: true };
}

async function createNew({ name, email, phone, address, city, block }) {
  await prisma.client.create({
    data: {
      name: name || 'Sans nom',
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      notes: block,
    },
  });
  return { created: true };
}

async function main() {
  let stats = { chatCreated: 0, chatUpdated: 0, chatSkipped: 0, rdvCreated: 0, rdvUpdated: 0, rdvSkipped: 0 };

  const chats = await prisma.chatConversation.findMany({
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  console.log(`[backfill] ${chats.length} chats`);
  for (const c of chats) {
    const email = normalizeEmail(c.clientEmail);
    const phoneDigits = normalizePhoneDigits(c.clientPhone);
    const phone = formatPhone(c.clientPhone);
    const block = buildChatBlock(c, c.messages || []);
    const existing = await findExisting({ email, phoneDigits });
    const res = existing
      ? await mergeInto({ existing, name: c.clientName, email, phone, block })
      : await createNew({ name: c.clientName, email, phone, block });
    if (res.created) stats.chatCreated++;
    else if (res.updated) stats.chatUpdated++;
    else stats.chatSkipped++;
  }

  const rdvs = await prisma.appointment.findMany();
  console.log(`[backfill] ${rdvs.length} rendez-vous`);
  for (const r of rdvs) {
    const email = normalizeEmail(r.email);
    const phoneDigits = normalizePhoneDigits(r.phone);
    const phone = formatPhone(r.phone);
    const block = buildRdvBlock(r);
    const existing = await findExisting({ email, phoneDigits });
    const res = existing
      ? await mergeInto({ existing, name: r.name, email, phone, address: r.address, city: r.city, block })
      : await createNew({ name: r.name, email, phone, address: r.address, city: r.city, block });
    if (res.created) stats.rdvCreated++;
    else if (res.updated) stats.rdvUpdated++;
    else stats.rdvSkipped++;
  }

  const total = await prisma.client.count();
  console.log(`[backfill] chat: +${stats.chatCreated} crees, ${stats.chatUpdated} enrichis, ${stats.chatSkipped} deja a jour`);
  console.log(`[backfill] rdv:  +${stats.rdvCreated} crees, ${stats.rdvUpdated} enrichis, ${stats.rdvSkipped} deja a jour`);
  console.log(`[backfill] total clients en BD: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
