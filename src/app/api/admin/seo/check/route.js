import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

async function checkGoogleRanking(cityName) {
  const query = `remplacement vitre thermos ${cityName}`;
  const url = `https://www.google.ca/search?q=${encodeURIComponent(query)}&hl=fr&gl=ca&num=20`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "fr-CA,fr;q=0.9,en;q=0.5",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return { position: null, aiMention: false, url: null };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Check for AI overview mention
    let aiMention = false;
    // AI overview sections can have various selectors
    const aiSelectors = [
      '[data-attrid="wa:/description"]',
      ".xpdopen",
      '[data-md="61"]',
      ".wDYxhc",
      ".ILfuVd",
    ];
    for (const sel of aiSelectors) {
      const aiSection = $(sel);
      if (aiSection.length > 0) {
        const aiText = aiSection.text().toLowerCase();
        if (
          aiText.includes("vosthermos") ||
          aiText.includes("vos-thermos") ||
          aiText.includes("vosthermos.com")
        ) {
          aiMention = true;
          break;
        }
      }
    }

    // Also check the full page for AI overview mentioning our site
    const fullText = $("body").text().toLowerCase();
    if (
      !aiMention &&
      (fullText.includes("ai overview") ||
        fullText.includes("apercu ia") ||
        fullText.includes("apercu de l'ia"))
    ) {
      // Check if vosthermos appears near these sections
      const bodyHtml = $("body").html() || "";
      const aiOverviewMatch = bodyHtml.match(
        /(?:ai.overview|apercu.*ia)[^]*?(?=<div class="g"|$)/i
      );
      if (aiOverviewMatch) {
        const sectionText = aiOverviewMatch[0].toLowerCase();
        if (
          sectionText.includes("vosthermos") ||
          sectionText.includes("vos-thermos")
        ) {
          aiMention = true;
        }
      }
    }

    // Find organic position
    let position = null;
    let foundUrl = null;

    // Method 1: Look for links containing vosthermos.com
    const allLinks = $("a[href]");
    let organicCount = 0;

    // Collect organic result containers
    const organicResults = [];

    // Google organic results are in <div class="g"> or similar
    $("div.g, div.tF2Cxc, div.yuRUbf").each((i, el) => {
      const container = $(el);
      const link = container.find("a[href]").first();
      const href = link.attr("href") || "";
      if (
        href &&
        !href.startsWith("/search") &&
        !href.startsWith("#") &&
        !href.includes("google.")
      ) {
        organicResults.push({ href, index: organicResults.length + 1 });
      }
    });

    // If div.g method found results, use those
    if (organicResults.length > 0) {
      for (const result of organicResults) {
        if (
          result.href.includes("vosthermos.com") ||
          result.href.includes("vosthermos")
        ) {
          position = result.index;
          foundUrl = result.href;
          break;
        }
      }
    }

    // Method 2: Fallback - scan all links in order
    if (position === null) {
      let linkPosition = 0;
      $("a").each((i, el) => {
        const href = $(el).attr("href") || "";
        if (
          href.startsWith("http") &&
          !href.includes("google.") &&
          !href.includes("youtube.") &&
          !href.includes("schema.org")
        ) {
          linkPosition++;
          if (
            position === null &&
            (href.includes("vosthermos.com") || href.includes("vosthermos"))
          ) {
            position = linkPosition;
            foundUrl = href;
          }
        }
      });
    }

    // Method 3: Check cite elements (Google shows URLs in cite tags)
    if (position === null) {
      let citePos = 0;
      $("cite").each((i, el) => {
        citePos++;
        const text = $(el).text();
        if (
          position === null &&
          (text.includes("vosthermos.com") || text.includes("vosthermos"))
        ) {
          position = citePos;
          foundUrl = text;
        }
      });
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
  } catch (err) {
    return new Response(JSON.stringify({ error: "Non autorise" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse optional city filter from body
  let cityFilter = null;
  try {
    const body = await request.json();
    cityFilter = body.city || null;
  } catch {
    // No body or invalid JSON, check all cities
  }

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

      for (let i = 0; i < citiesToCheck.length; i++) {
        const city = citiesToCheck[i];
        const keyword = `remplacement vitre thermos ${city.name}`;

        send({
          done: false,
          current: i + 1,
          total: citiesToCheck.length,
          city: city.name,
          slug: city.slug,
          status: "checking",
        });

        const result = await checkGoogleRanking(city.name);

        // Save to database
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

        // Wait 3 seconds between checks to avoid Google blocking
        if (i < citiesToCheck.length - 1) {
          await sleep(3000);
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
