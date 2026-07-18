import "server-only";

import prisma from "@/lib/prisma";
import { calculateThermosReplacement } from "@/lib/calc-engine";
import {
  THERMOS_PRICING_DEFAULTS,
  THERMOS_PRICING_KEYS,
  calculateThermosQuote,
  normalizeThermosPricingSettings,
} from "@/lib/thermos-pricing";

export async function getThermosPricingSettings() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: THERMOS_PRICING_KEYS } },
    select: { key: true, value: true },
  });

  const settings = { ...THERMOS_PRICING_DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;
  return normalizeThermosPricingSettings(settings);
}

export async function calculatePublicThermosReplacement({ widthInches, heightInches, quantity = 1 }, settingsInput) {
  const legacy = calculateThermosReplacement({ widthInches, heightInches, quantity });
  const settings = settingsInput || await getThermosPricingSettings();
  const quote = calculateThermosQuote([{
    width: widthInches,
    height: heightInches,
    quantity,
    lowE: true,
    argon: true,
    glassType: "double",
    spacerColor: "noir",
    thicknessSixteenths: 13,
    access: "easy",
  }], settings);
  const unitPriceMin = Math.round((quote.totals.totalMinWithTaxes / quantity) * 100) / 100;
  const unitPriceMax = Math.round((quote.totals.totalMaxWithTaxes / quantity) * 100) / 100;
  const defoggingTotalMax = Number(legacy.defoggingAlternative?.totalMax) || 0;
  const savingsPercent = quote.totals.totalMinWithTaxes > 0
    ? Math.max(0, Math.round(((quote.totals.totalMinWithTaxes - defoggingTotalMax) / quote.totals.totalMinWithTaxes) * 100))
    : 0;

  return {
    ...legacy,
    replacement: {
      ...legacy.replacement,
      unitPriceMin,
      unitPriceMax,
      totalMin: quote.totals.totalMinWithTaxes,
      totalMax: quote.totals.totalMaxWithTaxes,
      taxesIncluded: true,
    },
    defoggingAlternative: {
      ...legacy.defoggingAlternative,
      savings: `${savingsPercent}%`,
    },
    pricingSource: "thermos-pricing",
  };
}
