#!/usr/bin/env node

/**
 * Fetch Unsplash images for the realisations page (before/after projects).
 * Each project gets 2 images: one "before" (worn/old) and one "after" (new/clean).
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const UNSPLASH_API = "https://api.unsplash.com";
const IMG_DIR = path.join(process.cwd(), "public", "images", "realisations");
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const projects = [
  { id: 1, before: "old foggy window glass", after: "clean clear window residential" },
  { id: 2, before: "old patio door handle", after: "new sliding patio door home" },
  { id: 3, before: "old wooden door weathered", after: "restored wooden front door" },
  { id: 4, before: "old porch screen", after: "new screen porch veranda" },
  { id: 5, before: "cracked window caulking", after: "new window frame clean" },
  { id: 6, before: "foggy condo window", after: "clear condo window view" },
  { id: 7, before: "old window hardware", after: "modern casement window open" },
  { id: 8, before: "old french door wood", after: "beautiful french doors wood" },
  { id: 9, before: "old screen door worn", after: "retractable screen door patio" },
  { id: 10, before: "old house windows winter", after: "renovated house windows" },
];

async function fetchImage(query, filename) {
  const filepath = path.join(IMG_DIR, filename);
  if (fs.existsSync(filepath)) {
    console.log(`  SKIP ${filename} (exists)`);
    return;
  }

  const res = await fetch(
    `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5&content_filter=high`,
    { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
  );

  if (!res.ok) {
    console.error(`  ERROR ${res.status} for "${query}"`);
    return;
  }

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    console.log(`  NO RESULTS for "${query}"`);
    return;
  }

  const pick = data.results[Math.floor(Math.random() * Math.min(data.results.length, 3))];
  const imgUrl = pick.urls?.regular;
  if (!imgUrl) return;

  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) return;

  const fileStream = fs.createWriteStream(filepath);
  await pipeline(Readable.fromWeb(imgRes.body), fileStream);
  console.log(`  OK ${filename} (by ${pick.user?.name})`);
}

async function main() {
  if (!ACCESS_KEY) {
    console.error("UNSPLASH_ACCESS_KEY not set");
    process.exit(1);
  }

  fs.mkdirSync(IMG_DIR, { recursive: true });

  for (const p of projects) {
    console.log(`Project ${p.id}:`);
    await fetchImage(p.before, `project-${p.id}-before.jpg`);
    await new Promise((r) => setTimeout(r, 1500));
    await fetchImage(p.after, `project-${p.id}-after.jpg`);
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("\nDone!");
}

main().catch(console.error);
