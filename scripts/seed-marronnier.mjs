#!/usr/bin/env node
// Seed Le Marronnier test data: client syndicat + 4 buildings + units + openings + manager user
// Usage: node scripts/seed-marronnier.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const m = line.match(/^\s*([A-Z_][A-Z_0-9]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  });
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MANAGER_EMAIL = "lastb525@gmail.com";

async function main() {
  console.log("\n===== Seeding Le Marronnier =====\n");

  // 1. Client syndicat
  let client = await prisma.client.findFirst({ where: { name: "Syndicat Le Marronnier" } });
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: "Syndicat Le Marronnier",
        type: "gestionnaire",
        company: "Syndicat Le Marronnier",
        address: "1500 Montée Monette",
        city: "Laval",
        province: "QC",
        postalCode: "H7M 5C9",
        phone: "450-555-0100",
        email: "info@lemarronnier.ca",
        notes: "Copropriété de 18 unités réparties sur 4 bâtiments.",
      },
    });
    console.log(`[OK] Client créé: ${client.name} (id=${client.id})`);
  } else {
    console.log(`[SKIP] Client existe: ${client.name} (id=${client.id})`);
  }

  // 2. Buildings (4)
  const buildingDefs = [
    { code: "A", name: "Bâtiment A", position: 1 },
    { code: "B", name: "Bâtiment B", position: 2 },
    { code: "C", name: "Bâtiment C", position: 3 },
    { code: "D", name: "Bâtiment D", position: 4 },
  ];
  const buildings = {};
  for (const b of buildingDefs) {
    let building = await prisma.building.findFirst({ where: { clientId: client.id, code: b.code } });
    if (!building) {
      building = await prisma.building.create({
        data: { clientId: client.id, code: b.code, name: b.name, position: b.position },
      });
      console.log(`[OK] Bâtiment ${b.code} créé (id=${building.id})`);
    }
    buildings[b.code] = building;
  }

  // 3. Units (18) with building assignment
  const unitDefs = [
    { code: "A-101", building: "A" }, { code: "A-201", building: "A" }, { code: "A-202", building: "A" },
    { code: "A-301", building: "A" }, { code: "A-302", building: "A" },
    { code: "B-404", building: "B" }, { code: "B-408", building: "B" }, { code: "B-410", building: "B" },
    { code: "B-412", building: "B" }, { code: "B-416", building: "B" }, { code: "B-418", building: "B" },
    { code: "C-201", building: "C" }, { code: "C-203", building: "C" }, { code: "C-301", building: "C" },
    { code: "C-305", building: "C" }, { code: "C-402", building: "C" },
    { code: "D-101", building: "D" }, { code: "D-205", building: "D" },
  ];

  const units = {};
  for (const u of unitDefs) {
    let unit = await prisma.clientUnit.findFirst({
      where: { clientId: client.id, code: u.code },
    });
    if (!unit) {
      unit = await prisma.clientUnit.create({
        data: {
          clientId: client.id,
          buildingId: buildings[u.building].id,
          code: u.code,
          description: `Unité ${u.code}`,
        },
      });
      console.log(`[OK] Unité ${u.code} créée (id=${unit.id})`);
    } else if (!unit.buildingId) {
      unit = await prisma.clientUnit.update({
        where: { id: unit.id },
        data: { buildingId: buildings[u.building].id },
      });
      console.log(`[OK] Unité ${u.code} rattachée au bâtiment ${u.building}`);
    }
    units[u.code] = unit;
  }

  // 4. Openings pour unité B-412 (exemple riche)
  const b412 = units["B-412"];
  const existingOpenings = await prisma.unitOpening.count({ where: { unitId: b412.id } });
  if (existingOpenings === 0) {
    const openings = [
      { type: "fenetre", location: "Salon · nord", description: "Grande fenêtre fixe + battant inférieur", status: "active", year: 2014, brand: "Novatech", position: 1 },
      { type: "fenetre", location: "Chambre maître · est", description: "Fenêtre battante simple", status: "done", year: 2014, brand: "Novatech", position: 2 },
      { type: "fenetre", location: "Chambre 2 · ouest", description: "Fenêtre battante simple", status: "ok", year: 2014, brand: "Novatech", position: 3 },
      { type: "fenetre", location: "Cuisine · sud", description: "Fenêtre coulissante horizontale", status: "ok", year: 2014, brand: "Novatech", position: 4 },
      { type: "porte-patio", location: "Balcon · sud-est", description: "Porte-patio coulissante 2 panneaux", status: "ok", year: 2014, brand: "Novatech", position: 5 },
    ];
    for (const o of openings) {
      await prisma.unitOpening.create({ data: { ...o, unitId: b412.id } });
    }
    console.log(`[OK] 5 ouvertures créées pour unité B-412`);
  }

  // Openings simples pour autres unités (juste un count réaliste)
  for (const code of ["A-101", "B-404", "B-408", "C-301"]) {
    const u = units[code];
    const count = await prisma.unitOpening.count({ where: { unitId: u.id } });
    if (count === 0) {
      await prisma.unitOpening.createMany({
        data: [
          { unitId: u.id, type: "fenetre", location: "Salon", status: "ok", position: 1 },
          { unitId: u.id, type: "fenetre", location: "Chambre principale", status: "ok", position: 2 },
          { unitId: u.id, type: "porte-patio", location: "Balcon", status: code === "B-404" || code === "B-408" ? "active" : "ok", position: 3 },
        ],
      });
      console.log(`[OK] Ouvertures de base créées pour ${code}`);
    }
  }

  // 5. ManagerUser test
  let manager = await prisma.managerUser.findUnique({ where: { email: MANAGER_EMAIL } });
  if (!manager) {
    manager = await prisma.managerUser.create({
      data: {
        email: MANAGER_EMAIL,
        firstName: "Yannis",
        lastName: "D'Almeida (test)",
        isActive: true,
      },
    });
    console.log(`[OK] Gestionnaire test créé: ${manager.email} (id=${manager.id})`);
  } else {
    console.log(`[SKIP] Gestionnaire existe: ${manager.email}`);
  }

  // 6. Link manager to client (with full permissions)
  const link = await prisma.managerClient.findUnique({
    where: { managerId_clientId: { managerId: manager.id, clientId: client.id } },
  });
  if (!link) {
    await prisma.managerClient.create({
      data: {
        managerId: manager.id,
        clientId: client.id,
        permissions: ["view_work_orders", "view_invoices", "view_quotes", "request_intervention", "approve_quotes"],
      },
    });
    console.log(`[OK] Lien gestionnaire ↔ syndicat créé (permissions complètes)`);
  }

  console.log(`\n===== Seed terminé =====`);
  console.log(`\nGestionnaire test prêt:`);
  console.log(`  Email : ${MANAGER_EMAIL}`);
  console.log(`  Copro : ${client.name} (${client.city})`);
  console.log(`  Accès : https://www.vosthermos.com/gestionnaire/login\n`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Erreur seed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
