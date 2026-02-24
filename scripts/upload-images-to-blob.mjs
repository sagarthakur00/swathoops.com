#!/usr/bin/env node
// Upload all product images to Vercel Blob and output a URL mapping
import { put } from "@vercel/blob";
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN. Run: source .env.vercel");
  process.exit(1);
}

const PUBLIC_DIR = join(process.cwd(), "public");
const IMAGE_DIRS = ["images/creative", "images/lifestyle", "images/brand_image"];

function getFiles(dir) {
  const results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isFile() && !entry.startsWith(".")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  const mapping = {};
  let uploaded = 0;
  let failed = 0;

  for (const imageDir of IMAGE_DIRS) {
    const fullDir = join(PUBLIC_DIR, imageDir);
    let files;
    try {
      files = getFiles(fullDir);
    } catch {
      console.log(`Skipping ${imageDir} (not found)`);
      continue;
    }

    for (const filePath of files) {
      const relativePath = "/" + relative(PUBLIC_DIR, filePath);
      const blobPathname = relative(PUBLIC_DIR, filePath); // e.g. images/creative/1black_cloth.JPG

      try {
        const fileBuffer = readFileSync(filePath);
        const blob = await put(blobPathname, fileBuffer, {
          access: "public",
          addRandomSuffix: false,
          token: BLOB_TOKEN,
        });

        mapping[relativePath] = blob.url;
        uploaded++;
        console.log(`✓ [${uploaded}] ${relativePath} → ${blob.url}`);
      } catch (err) {
        failed++;
        console.error(`✗ Failed: ${relativePath} — ${err.message}`);
      }
    }
  }

  // Save mapping to file
  const outputPath = join(process.cwd(), "scripts", "image-url-mapping.json");
  writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
  console.log(`\nDone! Uploaded: ${uploaded}, Failed: ${failed}`);
  console.log(`Mapping saved to: ${outputPath}`);
}

main().catch(console.error);
