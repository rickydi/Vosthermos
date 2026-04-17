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
  address: "330 Ch. St-Francois-Xavier, Local 101",
  city: "Saint-Francois-Xavier-de-Brompton",
  postalCode: "J0H 1S0",
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
