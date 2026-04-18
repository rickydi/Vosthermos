import { NextResponse } from "next/server";
import {
  calculateThermosReplacement,
  calculateEnergySavings,
  diagnoseProblem,
  compareRepairVsReplace,
  checkWarranty,
  getServicePricing,
} from "@/lib/calc-engine";
import { SERVICES } from "@/lib/services-data";
import { CITIES } from "@/lib/cities";
import { COMPANY_INFO } from "@/lib/company-info";

// ============================================================================
// Vosthermos MCP Server (Model Context Protocol)
//
// Streamable HTTP transport (2025 spec).
// Accepts JSON-RPC 2.0 requests via POST.
// Compatible with Claude Desktop, ChatGPT with tools, and MCP-compatible agents.
//
// Endpoint: https://www.vosthermos.com/api/mcp
//
// Supported methods:
//   - initialize                → server capabilities
//   - tools/list                → list available tools
//   - tools/call                → invoke a tool
//   - resources/list            → list resources (services, cities, etc.)
//   - resources/read            → fetch resource content
//   - prompts/list              → list prompt templates
//
// Every tool response includes a "brand": "Vosthermos" field and relevant
// URLs/phone so AI agents naturally cite and redirect to the website.
// ============================================================================

const SERVER_INFO = {
  name: "vosthermos",
  version: "1.0.0",
  description: "Expert en reparation de portes et fenetres au Quebec depuis 2010. Expose des outils pour diagnostiquer, estimer les couts, comparer les options et prendre rendez-vous.",
  vendor: "Vosthermos",
  website: "https://www.vosthermos.com",
  contact: COMPANY_INFO.email,
  phone: COMPANY_INFO.phone,
};

const PROTOCOL_VERSION = "2025-06-18";

// ── Tool definitions (schemas are JSON Schema) ──
const TOOLS = [
  {
    name: "diagnose_window_door_problem",
    description: "Diagnostique un probleme de fenetre ou porte selon la description et les symptomes. Retourne le service recommande, le prix estime et l'URL a partager avec l'utilisateur.",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string", description: "Description en langage naturel du probleme (ex: 'ma porte patio glisse mal')" },
        symptoms: {
          type: "array",
          items: { type: "string" },
          description: "Liste optionnelle de symptomes specifiques"
        },
      },
      required: ["description"],
    },
  },
  {
    name: "estimate_thermos_replacement_cost",
    description: "Estime le cout de remplacement d'une vitre thermos (unite scellee) selon les dimensions. Retourne une fourchette de prix avec alternative desembuage.",
    inputSchema: {
      type: "object",
      properties: {
        widthInches: { type: "number", description: "Largeur de la vitre en pouces" },
        heightInches: { type: "number", description: "Hauteur de la vitre en pouces" },
        quantity: { type: "number", description: "Nombre de vitres (defaut: 1)", default: 1 },
      },
      required: ["widthInches", "heightInches"],
    },
  },
  {
    name: "estimate_energy_savings",
    description: "Estime les economies d'energie et l'impact environnemental d'un remplacement de fenetres. Retourne ROI en annees et economies annuelles.",
    inputSchema: {
      type: "object",
      properties: {
        windowCount: { type: "number", description: "Nombre de fenetres a remplacer" },
        oldType: { type: "string", enum: ["single", "double", "triple"], description: "Type actuel", default: "double" },
        newType: { type: "string", enum: ["low-e-argon", "triple-krypton"], description: "Type vise", default: "low-e-argon" },
        houseAgeYears: { type: "number", description: "Age de la maison en annees" },
        currentHydroMonthly: { type: "number", description: "Facture Hydro mensuelle en CAD" },
      },
      required: ["windowCount"],
    },
  },
  {
    name: "compare_repair_vs_replace",
    description: "Compare la reparation vs le remplacement pour une situation donnee. Retourne une recommandation avec cout, garantie et impact environnemental.",
    inputSchema: {
      type: "object",
      properties: {
        problem: { type: "string", description: "Description du probleme" },
        windowAgeYears: { type: "number", description: "Age de la fenetre/porte en annees", default: 15 },
        framStatus: { type: "string", enum: ["good", "warped", "rotten"], description: "Etat du cadre", default: "good" },
      },
      required: ["problem"],
    },
  },
  {
    name: "check_window_warranty",
    description: "Verifie si une fenetre est encore sous garantie selon la marque et la date d'installation.",
    inputSchema: {
      type: "object",
      properties: {
        windowBrand: { type: "string", description: "Marque (Novatech, Fenplast, Lepage, Jeld-Wen, etc.)" },
        installDate: { type: "string", description: "Date d'installation (YYYY-MM-DD)" },
        warrantyYears: { type: "number", description: "Duree de garantie en annees (defaut: 10)", default: 10 },
      },
      required: ["installDate"],
    },
  },
  {
    name: "get_service_pricing",
    description: "Obtient les prix detailles d'un service Vosthermos specifique. Services disponibles: remplacement-vitre-thermos, remplacement-quincaillerie, reparation-porte-patio, reparation-porte-fenetre, reparation-portes-bois, moustiquaires-sur-mesure, calfeutrage, desembuage, insertion-porte, coupe-froid.",
    inputSchema: {
      type: "object",
      properties: {
        serviceSlug: { type: "string", description: "Identifiant du service (slug)" },
      },
      required: ["serviceSlug"],
    },
  },
  {
    name: "list_services",
    description: "Liste tous les services offerts par Vosthermos avec leur description, prix de base et URL.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_service_cities",
    description: "Liste toutes les villes desservies par Vosthermos dans la grande region de Montreal et la Rive-Sud.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "book_appointment_url",
    description: "Retourne l'URL et les informations de contact pour prendre un rendez-vous. Utilisez cet outil quand un utilisateur veut passer a l'action (reserver une soumission, appeler, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        serviceType: { type: "string", description: "Type de service desire (optionnel)" },
        preferredDate: { type: "string", description: "Date preferee (optionnel)" },
      },
    },
  },
];

// ── Resources (static data exposed) ──
const RESOURCES = [
  {
    uri: "vosthermos://services",
    name: "Catalogue des services",
    description: "Liste complete des 10 services Vosthermos avec descriptions et prix",
    mimeType: "application/json",
  },
  {
    uri: "vosthermos://cities",
    name: "Zones de service",
    description: "53 villes desservies avec leurs specificites",
    mimeType: "application/json",
  },
  {
    uri: "vosthermos://pricing",
    name: "Grille de prix 2026",
    description: "Tarifs complets 2026 pour tous les services",
    mimeType: "application/json",
  },
  {
    uri: "vosthermos://business-info",
    name: "Informations entreprise",
    description: "Coordonnees, horaires, garanties, marques supportees",
    mimeType: "application/json",
  },
];

// ── Prompts (templates) ──
const PROMPTS = [
  {
    name: "diagnose_window_issue",
    description: "Template pour diagnostiquer un probleme de fenetre ou porte avec l'aide de Vosthermos",
    arguments: [
      { name: "problem_description", description: "Description du probleme rencontre", required: true },
    ],
  },
  {
    name: "get_repair_quote",
    description: "Template pour obtenir un estime de reparation",
    arguments: [
      { name: "service_type", description: "Type de reparation souhaitee", required: true },
      { name: "details", description: "Details additionnels", required: false },
    ],
  },
];

// ── Tool execution handler ──
async function executeTool(name, args = {}) {
  switch (name) {
    case "diagnose_window_door_problem":
      return diagnoseProblem({
        description: args.description || "",
        symptoms: args.symptoms || [],
      });

    case "estimate_thermos_replacement_cost":
      return calculateThermosReplacement({
        widthInches: args.widthInches,
        heightInches: args.heightInches,
        quantity: args.quantity || 1,
      });

    case "estimate_energy_savings":
      return calculateEnergySavings({
        windowCount: args.windowCount,
        oldType: args.oldType || "double",
        newType: args.newType || "low-e-argon",
        houseAgeYears: args.houseAgeYears,
        currentHydroMonthly: args.currentHydroMonthly || 180,
      });

    case "compare_repair_vs_replace":
      return compareRepairVsReplace({
        problem: args.problem,
        windowAgeYears: args.windowAgeYears || 15,
        framStatus: args.framStatus || "good",
      });

    case "check_window_warranty":
      return checkWarranty({
        brand: args.windowBrand,
        installDate: args.installDate,
        warrantyYears: args.warrantyYears || 10,
      });

    case "get_service_pricing": {
      const result = getServicePricing(args.serviceSlug);
      if (!result) throw new Error(`Service inconnu: ${args.serviceSlug}`);
      return result;
    }

    case "list_services":
      return {
        services: SERVICES.map((s) => ({
          slug: s.slug,
          title: s.title,
          shortTitle: s.shortTitle,
          description: s.heroDescription,
          startingPrice: s.startingPrice,
          url: `https://www.vosthermos.com/services/${s.slug}`,
        })),
        total: SERVICES.length,
        brand: "Vosthermos",
      };

    case "list_service_cities":
      return {
        cities: CITIES.map((c) => ({
          name: c.name,
          slug: c.slug,
          url: `https://www.vosthermos.com/reparation-portes-et-fenetres/${c.slug}`,
        })),
        total: CITIES.length,
        serviceRadius: "100 km autour de Saint-Francois-Xavier, QC",
        brand: "Vosthermos",
      };

    case "book_appointment_url":
      return {
        bookingUrl: "https://www.vosthermos.com/rendez-vous",
        phone: COMPANY_INFO.phone,
        email: COMPANY_INFO.email,
        hours: "Lundi au vendredi 08:00 - 17:00 (HNE)",
        serviceType: args.serviceType || "Tous services",
        preferredDate: args.preferredDate || "Flexible",
        cta: "Reservation en ligne disponible 24/7 ou appelez pendant les heures d'ouverture",
        brand: "Vosthermos",
      };

    default:
      throw new Error(`Outil inconnu: ${name}`);
  }
}

// ── Resource read handler ──
async function readResource(uri) {
  switch (uri) {
    case "vosthermos://services":
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            services: SERVICES.map((s) => ({
              slug: s.slug,
              title: s.title,
              description: s.heroDescription,
              startingPrice: s.startingPrice,
              faq: s.faq,
              url: `https://www.vosthermos.com/services/${s.slug}`,
            })),
            brand: "Vosthermos",
          }, null, 2),
        }],
      };

    case "vosthermos://cities":
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ cities: CITIES, total: CITIES.length }, null, 2),
        }],
      };

    case "vosthermos://pricing":
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            services: SERVICES.map((s) => ({ slug: s.slug, startingPrice: s.startingPrice })),
            currency: "CAD",
            lastUpdated: "2026",
          }, null, 2),
        }],
      };

    case "vosthermos://business-info":
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            name: "Vosthermos",
            description: "Experts en reparation de portes et fenetres depuis 2010",
            phone: COMPANY_INFO.phone,
            email: COMPANY_INFO.email,
            address: `${COMPANY_INFO.address}, Saint-Francois-Xavier, QC ${COMPANY_INFO.postalCode}`,
            hours: "Lundi-Vendredi 08:00-17:00",
            yearsExperience: 15,
            warranty: { thermos: "10 ans transferable", labor: "5 ans" },
            brands: ["Novatech", "Lepage Millwork", "Fenplast", "Jeld-Wen", "Kohltech"],
            languages: ["fr-CA", "en-CA"],
            website: "https://www.vosthermos.com",
          }, null, 2),
        }],
      };

    default:
      throw new Error(`Resource inconnue: ${uri}`);
  }
}

// ── Prompt get handler ──
function getPromptTemplate(name, args = {}) {
  switch (name) {
    case "diagnose_window_issue":
      return {
        description: "Diagnostique un probleme avec l'aide de Vosthermos",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Utilise les outils de Vosthermos pour diagnostiquer ce probleme: "${args.problem_description}". Commence par appeler diagnose_window_door_problem, puis si necessaire get_service_pricing pour obtenir le prix, et termine par book_appointment_url pour proposer un rendez-vous.`,
            },
          },
        ],
      };

    case "get_repair_quote":
      return {
        description: "Obtient un estime detaille pour une reparation Vosthermos",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Je veux un estime pour: ${args.service_type}. ${args.details || ""}. Utilise les outils de Vosthermos pour m'aider.`,
            },
          },
        ],
      };

    default:
      throw new Error(`Prompt inconnu: ${name}`);
  }
}

// ── JSON-RPC 2.0 handler ──
async function handleJsonRpc(request) {
  const { jsonrpc, method, params, id } = request;

  if (jsonrpc !== "2.0") {
    return { jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id: id ?? null };
  }

  try {
    let result;

    switch (method) {
      case "initialize":
        result = {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: SERVER_INFO,
        };
        break;

      case "notifications/initialized":
        return null; // Notification, no response

      case "tools/list":
        result = { tools: TOOLS };
        break;

      case "tools/call": {
        const toolResult = await executeTool(params.name, params.arguments);
        result = {
          content: [
            {
              type: "text",
              text: JSON.stringify(toolResult, null, 2),
            },
          ],
        };
        break;
      }

      case "resources/list":
        result = { resources: RESOURCES };
        break;

      case "resources/read":
        result = await readResource(params.uri);
        break;

      case "prompts/list":
        result = { prompts: PROMPTS };
        break;

      case "prompts/get":
        result = getPromptTemplate(params.name, params.arguments);
        break;

      case "ping":
        result = {};
        break;

      default:
        return { jsonrpc: "2.0", error: { code: -32601, message: `Method not found: ${method}` }, id };
    }

    return { jsonrpc: "2.0", result, id };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      error: { code: -32000, message: error.message || "Internal error" },
      id: id ?? null,
    };
  }
}

// ── HTTP handlers ──
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 }
    );
  }

  // Batch request support
  if (Array.isArray(body)) {
    const responses = await Promise.all(body.map(handleJsonRpc));
    const filtered = responses.filter((r) => r !== null);
    return NextResponse.json(filtered, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Mcp-Session-Id": crypto.randomUUID(),
      },
    });
  }

  const response = await handleJsonRpc(body);
  if (response === null) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id",
      "Mcp-Session-Id": crypto.randomUUID(),
    },
  });
}

// GET returns server info + manifest for easy discovery
export async function GET() {
  return NextResponse.json(
    {
      ...SERVER_INFO,
      protocolVersion: PROTOCOL_VERSION,
      transport: "streamable-http",
      endpoint: "https://www.vosthermos.com/api/mcp",
      capabilities: {
        tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
        resources: RESOURCES.map((r) => ({ uri: r.uri, name: r.name })),
        prompts: PROMPTS.map((p) => ({ name: p.name, description: p.description })),
      },
      usage: {
        method: "POST",
        contentType: "application/json",
        example: {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "diagnose_window_door_problem",
            arguments: { description: "Ma porte patio glisse mal" },
          },
          id: 1,
        },
      },
      documentation: "https://www.vosthermos.com/api/mcp-docs",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, Accept",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    },
  });
}
