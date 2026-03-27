import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const UNSPLASH_API = "https://api.unsplash.com";
const BLOG_IMG_DIR = path.join(process.cwd(), "public", "images", "blog");

// Map keywords found in article titles/slugs to precise Unsplash search queries
// All queries target North American / Canadian suburban residential context
const keywordToQuery = [
  { match: /thermos|vitre|verre|low-e|argon|embue|buee/, query: "foggy window glass condensation residential house" },
  { match: /moustiquaire/, query: "open window summer suburban home backyard" },
  { match: /calfeutr/, query: "caulking gun window frame renovation worker" },
  { match: /coupe-froid|weatherstrip/, query: "frost on window winter cold canada house" },
  { match: /porte-patio|patio/, query: "patio door home backyard" },
  { match: /chauffage|economis|energie/, query: "snowy house winter canada" },
  { match: /inspection|printan/, query: "house spring neighborhood residential" },
  { match: /reparer|remplacer|reparation|remplacement/, query: "window replacement installation worker residential home" },
  { match: /quincaillerie|poignee|serrure/, query: "window handle hardware closeup residential" },
  { match: /bois|porte.*bois/, query: "wooden front door residential house entrance north america" },
  { match: /hiver|froid|neige|gel/, query: "snow covered house winter canada residential neighborhood" },
  { match: /ete|soleil|chaleur/, query: "sunny suburban house summer canada residential" },
  { match: /automne/, query: "autumn leaves house canada suburban neighborhood" },
  { match: /condensation|humidite/, query: "water drops window glass condensation closeup" },
  { match: /subvention|credit|cout|prix/, query: "home renovation contractor worker residential canada" },
  { match: /mesurer|mesure|dimension/, query: "measuring tape window frame installation" },
  { match: /entretien/, query: "house window cleaning maintenance suburban residential" },
];

// Fallback queries by category - North American / Canadian residential context
const categoryFallback = {
  conseils: "suburban house windows canada residential neighborhood",
  entretien: "home maintenance window cleaning suburban",
  guides: "window installation worker residential house",
  nouvelles: "modern suburban home canada residential",
};

function buildQuery(slug, category, title) {
  const text = `${slug} ${title}`.toLowerCase();

  for (const { match, query } of keywordToQuery) {
    if (match.test(text)) return query;
  }

  return categoryFallback[category] || categoryFallback.conseils;
}

export async function fetchBlogCoverImage(slug, category, title) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log("UNSPLASH_ACCESS_KEY not set, skipping image fetch");
    return null;
  }

  fs.mkdirSync(BLOG_IMG_DIR, { recursive: true });

  const query = buildQuery(slug, category, title);
  console.log(`  Search: "${query}"`);

  try {
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=10&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!res.ok) {
      console.error(`Unsplash API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const results = data.results;
    if (!results || results.length === 0) {
      console.log(`  No results for "${query}"`);
      return null;
    }

    // Pick a random photo from top results for variety
    const pick = results[Math.floor(Math.random() * Math.min(results.length, 5))];
    const imageUrl = pick.urls?.regular;
    if (!imageUrl) return null;

    const ext = "jpg";
    const filename = `${slug}.${ext}`;
    const filepath = path.join(BLOG_IMG_DIR, filename);

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;

    const fileStream = fs.createWriteStream(filepath);
    await pipeline(Readable.fromWeb(imgRes.body), fileStream);

    if (pick.user?.name) {
      console.log(`  Photo by ${pick.user.name} on Unsplash`);
    }

    return `/images/blog/${filename}`;
  } catch (err) {
    console.error("Failed to fetch Unsplash image:", err.message);
    return null;
  }
}
