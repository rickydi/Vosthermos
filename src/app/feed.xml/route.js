import prisma from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vosthermos - Blogue</title>
    <link>https://www.vosthermos.com/blogue</link>
    <description>Conseils et guides pour la reparation de portes et fenetres au Quebec</description>
    <language>fr-ca</language>
    <atom:link href="https://www.vosthermos.com/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(p => `<item>
      <title>${escapeXml(p.title)}</title>
      <link>https://www.vosthermos.com/blogue/${p.slug}</link>
      <description>${escapeXml(p.excerpt)}</description>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <guid>https://www.vosthermos.com/blogue/${p.slug}</guid>
    </item>`).join("\n")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

function escapeXml(s) {
  return s?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") || "";
}
