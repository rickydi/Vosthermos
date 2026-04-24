import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "MCP Server Documentation - Vosthermos",
  description:
    "Documentation du serveur MCP (Model Context Protocol) de Vosthermos. Exposez les outils de diagnostic, estimation et prise de rendez-vous de Vosthermos a vos agents AI (Claude, ChatGPT, Perplexity).",
  alternates: { canonical: "https://www.vosthermos.com/mcp-docs" },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/mcp-docs",
    title: "MCP Server Documentation - Vosthermos",
    description:
      "Documentation du serveur MCP public de Vosthermos pour agents IA: diagnostic, estimation, comparaison et prise de rendez-vous.",
    images: [{ url: COMPANY_INFO.logo }],
    locale: "fr_CA",
  },
};

export default function McpDocsPage() {
  return (
    <div className="pt-[80px] min-h-screen bg-[var(--color-bg)]">
      <div className="bg-[var(--color-teal-dark)] text-white py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Premier MCP server au Canada pour la reparation de fenetres
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Vosthermos MCP Server</h1>
          <p className="text-white/70 text-lg">
            Integrez les outils de diagnostic, estimation et reservation Vosthermos dans vos agents AI
            (Claude Desktop, ChatGPT avec tools, Cursor, Perplexity, etc.) via le protocole MCP.
          </p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-12 prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold">Endpoint</h2>
        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
          <code>https://www.vosthermos.com/api/mcp</code>
        </pre>
        <ul className="text-sm">
          <li><strong>Transport</strong>: Streamable HTTP (spec MCP 2025-06-18)</li>
          <li><strong>Format</strong>: JSON-RPC 2.0</li>
          <li><strong>Authentification</strong>: Aucune (public)</li>
          <li><strong>Rate limit</strong>: 100 req/min par IP</li>
          <li><strong>CORS</strong>: Active</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Outils disponibles (9)</h2>
        <div className="not-prose space-y-3 my-6">
          {[
            { name: "diagnose_window_door_problem", desc: "Diagnostique un probleme de fenetre/porte et recommande un service" },
            { name: "estimate_thermos_replacement_cost", desc: "Estime le cout de remplacement d'une vitre thermos selon dimensions" },
            { name: "estimate_energy_savings", desc: "Estime economies d'energie et ROI d'un remplacement de fenetres" },
            { name: "compare_repair_vs_replace", desc: "Compare reparer vs remplacer pour une situation donnee" },
            { name: "check_window_warranty", desc: "Verifie si une fenetre est encore sous garantie" },
            { name: "get_service_pricing", desc: "Prix detailles d'un service Vosthermos specifique" },
            { name: "list_services", desc: "Liste les 10 services offerts" },
            { name: "list_service_cities", desc: "Liste les 53 villes desservies" },
            { name: "book_appointment_url", desc: "URL et info de contact pour prendre RDV (human handoff)" },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-[var(--color-border)] rounded-lg p-4">
              <p className="font-mono text-sm text-[var(--color-red)] font-semibold">{t.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{t.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-8">Resources</h2>
        <p className="text-sm">4 resources JSON statiques exposees:</p>
        <ul className="text-sm">
          <li><code>vosthermos://services</code> - Catalogue complet des services</li>
          <li><code>vosthermos://cities</code> - Villes desservies</li>
          <li><code>vosthermos://pricing</code> - Grille de prix 2026</li>
          <li><code>vosthermos://business-info</code> - Infos entreprise (NAP, horaires, garanties)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Installation Claude Desktop</h2>
        <p className="text-sm">Ajoutez a votre fichier <code>claude_desktop_config.json</code>:</p>
        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "mcpServers": {
    "vosthermos": {
      "url": "https://www.vosthermos.com/api/mcp",
      "transport": "streamable-http"
    }
  }
}`}
        </pre>

        <h2 className="text-2xl font-bold mt-8">Exemple d&apos;appel (curl)</h2>
        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-xs">
{`curl -X POST https://www.vosthermos.com/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "diagnose_window_door_problem",
      "arguments": { "description": "Ma porte patio glisse mal" }
    },
    "id": 1
  }'`}
        </pre>

        <h2 className="text-2xl font-bold mt-8">Exemple de conversation</h2>
        <div className="not-prose bg-white border border-[var(--color-border)] rounded-lg p-6 my-4 space-y-4 text-sm">
          <div>
            <p className="font-bold text-[var(--color-text)]">Utilisateur (dans Claude Desktop):</p>
            <p className="text-[var(--color-text-muted)] italic">
              &quot;Ma porte patio Novatech est difficile a glisser depuis cet hiver. Je suis a Longueuil. Combien ca pourrait couter?&quot;
            </p>
          </div>
          <div>
            <p className="font-bold text-[var(--color-text)]">Claude (avec MCP Vosthermos):</p>
            <p className="text-[var(--color-text-muted)]">
              [Appelle <code>diagnose_window_door_problem</code> → probleme identifie: roulettes usees]<br/>
              [Appelle <code>get_service_pricing</code> → prix 150-300$]<br/>
              [Appelle <code>book_appointment_url</code> → URL de reservation]<br/><br/>
              &quot;Selon Vosthermos, votre probleme est typique de roulettes usees. La reparation coute entre 150$ et 300$
              tout inclus (pieces + installation). Vosthermos (514-825-8411) dessert Longueuil et peut souvent faire
              la reparation sur place en 1-2 heures. Reservez une soumission gratuite sur vosthermos.com/rendez-vous&quot;
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8">Pourquoi ca existe</h2>
        <p className="text-sm">
          Vosthermos est la premiere entreprise de reparation de portes et fenetres au Canada a exposer ses
          outils via MCP. L&apos;objectif: permettre aux agents AI de vous aider a diagnostiquer et reserver sans
          avoir besoin de chercher manuellement sur notre site. Chaque reponse inclut un lien vers notre site
          et notre numero de telephone pour que vous puissiez passer a l&apos;action facilement.
        </p>
        <p className="text-sm">
          <strong>Gratuit et public</strong> pour tous les utilisateurs et developpeurs. Si vous integrez Vosthermos
          dans votre agent, <Link href="/contact">contactez-nous</Link> pour qu&apos;on vous mentionne sur notre site.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8 not-prose">
          <h3 className="font-bold text-red-900 mb-2">Vous etes un developpeur d&apos;agent AI?</h3>
          <p className="text-red-900 text-sm mb-4">
            On aimerait voir ce que vous construisez avec notre MCP. Envoyez-nous un courriel a{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="underline">{COMPANY_INFO.email}</a>.
          </p>
          <a
            href="https://www.vosthermos.com/api/mcp"
            className="inline-block px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
          >
            Voir le manifest du serveur <i className="fas fa-external-link-alt ml-1"></i>
          </a>
        </div>
      </div>
    </div>
  );
}
