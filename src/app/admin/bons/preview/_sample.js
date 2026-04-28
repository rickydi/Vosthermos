// Shared sample data for invoice design previews.
// Based on a realistic Marronnier B2B work order.
export const SAMPLE_WO = {
  number: "VOT-2026-042",
  date: new Date("2026-04-17"),
  arrival: "09:30",
  departure: "14:15",
  duration: "4h45",
  technician: "Erik Deschenes",
  client: {
    name: "Le Marronnier",
    company: "SDC Le Marronnier",
    address: "1500, montee Monette",
    city: "Laval",
    postalCode: "H7M 5C9",
    phone: "(450) 555-0123",
    email: "ydalmeida@lemarronnier.ca",
  },
  sections: [
    {
      unitCode: "F-0411",
      items: [
        { description: "Thermo grand (40-50\")", qty: 1, unitPrice: 550 },
        { description: "Installation grande (41\"+)", qty: 1, unitPrice: 200 },
        { description: "Verre securite + moulures alu", qty: 1, unitPrice: 750 },
      ],
    },
    {
      unitCode: "E-0510",
      items: [
        { description: "Ajustement barrure porte balcon", qty: 1, unitPrice: 120 },
      ],
    },
    {
      unitCode: "C-1111",
      items: [
        { description: "Thermo moyen (30-40\")", qty: 1, unitPrice: 300 },
        { description: "Installation standard", qty: 1, unitPrice: 90 },
      ],
    },
  ],
  description: "",
  laborHours: 2,
  laborRate: 85,
};

export function computeTotals(wo) {
  let totalPieces = 0;
  for (const sec of wo.sections) {
    for (const it of sec.items) totalPieces += it.qty * it.unitPrice;
  }
  const totalLabor = wo.laborHours * wo.laborRate;
  const subtotal = totalPieces + totalLabor;
  const tps = Math.round(subtotal * 0.05 * 100) / 100;
  const tvq = Math.round(subtotal * 0.09975 * 100) / 100;
  const total = subtotal + tps + tvq;
  return { totalPieces, totalLabor, subtotal, tps, tvq, total };
}

export const COMPANY = {
  name: "Vosthermos",
  legal: "9999-9999 Quebec inc.",
  address: "330 Chem. Saint-François-Xavier, local 104",
  city: "Delson",
  postalCode: "J5B 1Y1",
  phone: "514-825-8411",
  email: "info@vosthermos.com",
  web: "vosthermos.com",
  tps: "XXXXX XXXX RT0001",
  tvq: "XXXXXXXXXX TQ0001",
};

export function fmt(n) {
  return `${Number(n || 0).toFixed(2)} $`;
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("fr-CA", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Larger samples for multi-page preview ───────────────────────
const THERMO_SMALL = { description: "Thermo petit (jusqu'a 30\")", qty: 1, unitPrice: 250 };
const THERMO_MEDIUM = { description: "Thermo moyen (30-40\")", qty: 1, unitPrice: 300 };
const THERMO_LARGE = { description: "Thermo grand (40-50\")", qty: 1, unitPrice: 550 };
const THERMO_XL = { description: "Thermo XL (50\"+)", qty: 1, unitPrice: 750 };
const INSTALL_STD = { description: "Installation standard", qty: 1, unitPrice: 90 };
const INSTALL_BIG = { description: "Installation grande (41\"+)", qty: 1, unitPrice: 200 };
const AJUST_BARRURE = { description: "Ajustement barrure porte balcon", qty: 1, unitPrice: 120 };
const AJUST_LOCK = { description: "Ajustement lock porte + plaquette fermeture", qty: 1, unitPrice: 120 };
const BALAI_PORTE = { description: "Balai de porte", qty: 1, unitPrice: 160 };
const MANIVELLE = { description: "Manivelle fenetre + poignee plinthe", qty: 1, unitPrice: 160 };
const ROULETTES = { description: "Roulettes porte moustiquaire", qty: 1, unitPrice: 80 };
const VERRE_SECU = { description: "Verre securite + moulures alu", qty: 1, unitPrice: 750 };
const COUPE_FROIDE = { description: "Coupe froide patin", qty: 1, unitPrice: 275 };
const BARRURE_FEN = { description: "Barrure fenetre", qty: 1, unitPrice: 80 };

export const SAMPLE_WO_MEDIUM = {
  ...SAMPLE_WO,
  number: "VOT-2026-048",
  laborHours: 5,
  sections: [
    { unitCode: "F-0411", items: [THERMO_LARGE, INSTALL_BIG, VERRE_SECU] },
    { unitCode: "E-0510", items: [AJUST_BARRURE] },
    { unitCode: "C-1111", items: [THERMO_MEDIUM, INSTALL_STD] },
    { unitCode: "E-0815", items: [BALAI_PORTE] },
    { unitCode: "E-1217", items: [AJUST_LOCK] },
    { unitCode: "E-1517", items: [THERMO_SMALL, INSTALL_STD, { description: "2 ajustements fenetres", qty: 2, unitPrice: 30 }] },
    { unitCode: "C-1221", items: [THERMO_MEDIUM, INSTALL_STD, { description: "Fenetre complete (charnieres, manivelle, ajustement)", qty: 1, unitPrice: 390 }] },
    { unitCode: "A-0323", items: [{ description: "Thermos fenetres", qty: 2, unitPrice: 290 }, COUPE_FROIDE] },
    { unitCode: "F-0812", items: [ROULETTES] },
  ],
};

export const SAMPLE_WO_LARGE = {
  ...SAMPLE_WO,
  number: "VOT-2026-053",
  laborHours: 9,
  sections: [
    { unitCode: "F-0401", items: [{ description: "Thermo special (Benjamin)", qty: 1, unitPrice: 750 }, VERRE_SECU] },
    { unitCode: "F-0411", items: [THERMO_LARGE, INSTALL_BIG, VERRE_SECU] },
    { unitCode: "F-0812", items: [ROULETTES, { description: "Ajustement porte moustiquaire", qty: 1, unitPrice: 60 }] },
    { unitCode: "C-0420", items: [{ description: "Thermos fixes changes", qty: 6, unitPrice: 300 }, { description: "Installation multi-thermos", qty: 1, unitPrice: 500 }] },
    { unitCode: "C-0511", items: [{ description: "Thermo fixe", qty: 1, unitPrice: 300 }, INSTALL_STD] },
    { unitCode: "C-1111", items: [THERMO_MEDIUM, INSTALL_STD] },
    { unitCode: "C-1221", items: [THERMO_MEDIUM, INSTALL_STD, { description: "Fenetre (charnieres, manivelle, ajust.)", qty: 1, unitPrice: 390 }] },
    { unitCode: "E-0203", items: [THERMO_SMALL, INSTALL_STD] },
    { unitCode: "E-0210", items: [THERMO_SMALL, INSTALL_STD] },
    { unitCode: "E-0215", items: [THERMO_SMALL, INSTALL_STD] },
    { unitCode: "E-0510", items: [AJUST_BARRURE] },
    { unitCode: "E-0815", items: [BALAI_PORTE] },
    { unitCode: "E-1216", items: [BARRURE_FEN, { description: "Installation", qty: 1, unitPrice: 60 }] },
    { unitCode: "E-1217", items: [AJUST_LOCK] },
    { unitCode: "E-1517", items: [THERMO_SMALL, INSTALL_STD, { description: "Ajustements fenetres avec poignee", qty: 2, unitPrice: 30 }] },
    { unitCode: "A-0323", items: [{ description: "Thermos fenetres", qty: 2, unitPrice: 290 }, COUPE_FROIDE] },
    { unitCode: "D-0501", items: [MANIVELLE] },
    { unitCode: "0511", items: [{ description: "Thermo fixe", qty: 1, unitPrice: 300 }, INSTALL_STD] },
  ],
};
