import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";

export const dynamic = "force-dynamic";

async function checkRankingSerper(cityName) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return { position: null, aiMention: false, url: null, error: "No API key" };

  const query = `remplacement vitre thermos ${cityName}`;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "ca",
        hl: "fr",
        num: 20,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Serper error for ${cityName}:`, err);
      return { position: null, aiMention: false, url: null };
    }

    const data = await res.json();

    // Find organic position
    let position = null;
    let foundUrl = null;
    const organic = data.organic || [];

    for (let i = 0; i < organic.length; i++) {
      const link = organic[i].link || "";
      if (link.includes("vosthermos.com") || link.includes("vosthermos")) {
        position = organic[i].position || i + 1;
        foundUrl = link;
        break;
      }
    }

    // Check AI overview / answer box / knowledge graph for mention
    let aiMention = false;

    // Check answerBox
    if (data.answerBox) {
      const abText = JSON.stringify(data.answerBox).toLowerCase();
      if (abText.includes("vosthermos")) aiMention = true;
    }

    // Check knowledgeGraph
    if (data.knowledgeGraph) {
      const kgText = JSON.stringify(data.knowledgeGraph).toLowerCase();
      if (kgText.includes("vosthermos")) aiMention = true;
    }

    // Check AI overview (if serper returns it)
    if (data.aiOverview) {
      const aiText = JSON.stringify(data.aiOverview).toLowerCase();
      if (aiText.includes("vosthermos")) aiMention = true;
    }

    return { position, aiMention, url: foundUrl };
  } catch (err) {
    console.error(`Error checking ranking for ${cityName}:`, err.message);
    return { position: null, aiMention: false, url: null };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request) {
  try {
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.SERPER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "SERPER_API_KEY manquant dans .env" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let cityFilter = null;
  let keywordBase = "remplacement vitre thermos";
  try {
    const body = await request.json();
    cityFilter = body.city || null;
    if (body.keyword) keywordBase = body.keyword;
  } catch {}

  const citiesToCheck = cityFilter
    ? CITIES.filter((c) => c.slug === cityFilter)
    : CITIES;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      function ping() {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }

      for (let i = 0; i < citiesToCheck.length; i++) {
        const city = citiesToCheck[i];
        const keyword = `${keywordBase} ${city.name}`;

        send({
          done: false,
          current: i + 1,
          total: citiesToCheck.length,
          city: city.name,
          slug: city.slug,
          status: "checking",
        });

        // Ping to keep connection alive during API call
        const pingInterval = setInterval(ping, 5000);
        const result = await checkRankingSerper(city.name);
        clearInterval(pingInterval);

        try {
          await prisma.seoRanking.create({
            data: {
              city: city.slug,
              cityName: city.name,
              keyword,
              position: result.position,
              aiMention: result.aiMention,
              url: result.url,
            },
          });
        } catch (dbErr) {
          console.error(`DB error for ${city.name}:`, dbErr.message);
        }

        send({
          done: false,
          current: i + 1,
          total: citiesToCheck.length,
          city: city.name,
          slug: city.slug,
          position: result.position,
          aiMention: result.aiMention,
          url: result.url,
          status: "done",
        });

        if (i < citiesToCheck.length - 1) {
          await sleep(500);
        }
      }

      send({ done: true });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
