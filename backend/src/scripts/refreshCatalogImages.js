'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CATALOG_PATHS = [
  path.resolve(__dirname, '../../data/kalakart_artisan_products.json'),
  path.resolve(__dirname, '../../backend/data/kalakart_artisan_products.json'),
];

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UPDATE_LIMIT = Number(process.env.UNSPLASH_UPDATE_LIMIT || 70);
const REQUEST_DELAY_MS = Number(process.env.UNSPLASH_REQUEST_DELAY_MS || 350);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuery(entry) {
  return [entry.product_name, entry.category, entry.seller_specialty, 'handmade', 'india']
    .filter(Boolean)
    .join(' ')
    .trim();
}

function needsRefresh(imageUrl) {
  return !imageUrl || imageUrl.includes('source.unsplash.com');
}

function makeRenderableUrl(rawUrl) {
  if (!rawUrl) return null;
  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}auto=format&fit=crop&w=600&h=600&q=80`;
}

async function fetchUnsplashImage(query, cache) {
  if (cache.has(query)) {
    return cache.get(query);
  }

  const response = await axios.get('https://api.unsplash.com/search/photos', {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
    params: {
      query,
      per_page: 1,
      page: 1,
      orientation: 'squarish',
      content_filter: 'high',
    },
    timeout: 15000,
  });

  const result = response?.data?.results?.[0] || null;
  const resolved = makeRenderableUrl(result?.urls?.raw) || makeRenderableUrl(result?.urls?.regular) || null;
  cache.set(query, resolved);
  return resolved;
}

function readCatalog(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeCatalog(filePath, entries) {
  fs.writeFileSync(filePath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

async function refreshSingleCatalog(filePath) {
  const entries = readCatalog(filePath);
  const cache = new Map();

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (updated >= UPDATE_LIMIT) break;

    if (!needsRefresh(entry.image_url)) {
      skipped += 1;
      continue;
    }

    const query = buildQuery(entry);

    try {
      const url = await fetchUnsplashImage(query, cache);
      if (url) {
        entry.image_url = url;
        updated += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      failed += 1;
      const status = error?.response?.status;
      const reason = status ? `HTTP ${status}` : error.message;
      console.warn(`⚠️  Unsplash fetch failed for "${entry.product_name}": ${reason}`);

      if (status === 401 || status === 403 || status === 429) {
        console.warn('⚠️  Stopping early due to auth/rate-limit response from Unsplash API.');
        break;
      }
    }

    await sleep(REQUEST_DELAY_MS);
  }

  writeCatalog(filePath, entries);
  return { updated, failed, skipped, total: entries.length };
}

async function main() {
  if (!ACCESS_KEY) {
    console.error('❌ UNSPLASH_ACCESS_KEY is required.');
    process.exit(1);
  }

  const uniquePaths = Array.from(new Set(CATALOG_PATHS));

  for (const filePath of uniquePaths) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Skipping missing catalog file: ${filePath}`);
      continue;
    }

    console.log(`\n🔄 Refreshing images in: ${filePath}`);
    const result = await refreshSingleCatalog(filePath);
    console.log(`✅ Done. Updated: ${result.updated}, Failed: ${result.failed}, Skipped: ${result.skipped}, Total: ${result.total}`);
  }

  console.log('\n✅ Catalog image refresh completed.');
}

main().catch((error) => {
  console.error('❌ Refresh failed:', error.message);
  process.exit(1);
});
