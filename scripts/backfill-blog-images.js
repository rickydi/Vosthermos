#!/usr/bin/env node

/**
 * Backfill cover images for existing blog posts that don't have one.
 * Fetches images from Unsplash API.
 *
 * Usage: node scripts/backfill-blog-images.js
 * Requires: UNSPLASH_ACCESS_KEY and DATABASE_URL in .env
 */

import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { fetchBlogCoverImage } from "../src/lib/unsplash.js";

const { Pool } = pg;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const posts = await prisma.blogPost.findMany({
    where: { coverImage: null },
    orderBy: { publishedAt: "desc" },
  });

  console.log(`Found ${posts.length} posts without cover images.\n`);

  for (const post of posts) {
    console.log(`[${post.id}] ${post.title}`);

    const coverImage = await fetchBlogCoverImage(post.slug, post.category, post.title);

    if (coverImage) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { coverImage },
      });
      console.log(`  -> ${coverImage}\n`);
    } else {
      console.log(`  -> SKIPPED (no image found)\n`);
    }

    // Respect Unsplash rate limit (50 req/h)
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("Done!");
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
