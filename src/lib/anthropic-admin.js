import prisma from "@/lib/prisma";

export const DEFAULT_ADMIN_AI_MODEL = "claude-sonnet-4-6";

const MODEL_COSTS_USD_PER_MILLION = {
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-sonnet-4-20250514": { input: 3, output: 15, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-sonnet-4-0": { input: 3, output: 15, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-opus-4-8": { input: 5, output: 25, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-3-7-sonnet-20250219": { input: 3, output: 15, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-3-7-sonnet-latest": { input: 3, output: 15, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "claude-3-5-haiku-latest": { input: 0.8, output: 4, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
};

function cleanModel(value) {
  const model = String(value || "").trim();
  if (!model) return DEFAULT_ADMIN_AI_MODEL;
  if (!/^claude-[a-z0-9-]+$/i.test(model)) return DEFAULT_ADMIN_AI_MODEL;
  return model;
}

export async function getAnthropicApiKey() {
  let apiKey = process.env.ANTHROPIC_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe("SELECT value FROM site_settings WHERE key = 'api_key_anthropic'");
    if (rows[0]?.value) apiKey = rows[0].value;
  } catch {}
  return apiKey || "";
}

export async function getAdminAiSettings() {
  const result = {
    model: DEFAULT_ADMIN_AI_MODEL,
    source: "default",
  };

  try {
    const rows = await prisma.$queryRawUnsafe("SELECT value FROM site_settings WHERE key = 'ai_model_admin'");
    if (rows[0]?.value) {
      result.model = cleanModel(rows[0].value);
      result.source = "settings";
    }
  } catch {}

  return result;
}

export function estimateAnthropicCost(usage = {}, model = DEFAULT_ADMIN_AI_MODEL) {
  const pricing = MODEL_COSTS_USD_PER_MILLION[model] || MODEL_COSTS_USD_PER_MILLION[DEFAULT_ADMIN_AI_MODEL];
  const inputTokens = Number(usage.input_tokens || 0);
  const outputTokens = Number(usage.output_tokens || 0);
  const cacheCreationInputTokens = Number(usage.cache_creation_input_tokens || 0);
  const cacheReadInputTokens = Number(usage.cache_read_input_tokens || 0);

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const cacheWriteCost = (cacheCreationInputTokens / 1_000_000) * pricing.input * pricing.cacheWriteMultiplier;
  const cacheReadCost = (cacheReadInputTokens / 1_000_000) * pricing.input * pricing.cacheReadMultiplier;

  return {
    model,
    currency: "USD",
    inputTokens,
    outputTokens,
    cacheCreationInputTokens,
    cacheReadInputTokens,
    estimatedUsd: Math.round((inputCost + outputCost + cacheWriteCost + cacheReadCost) * 1_000_000) / 1_000_000,
  };
}

export async function callAnthropicAdmin({ maxTokens, system, messages }) {
  const [apiKey, aiSettings] = await Promise.all([
    getAnthropicApiKey(),
    getAdminAiSettings(),
  ]);

  if (!apiKey) {
    const err = new Error("ANTHROPIC_API_KEY manquant");
    err.status = 500;
    throw err;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: aiSettings.model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    const err = new Error(`Erreur API Anthropic ${response.status}`);
    err.status = response.status;
    err.detail = detail;
    throw err;
  }

  const data = await response.json();
  return {
    data,
    model: aiSettings.model,
    analysisCost: estimateAnthropicCost(data.usage, aiSettings.model),
  };
}
