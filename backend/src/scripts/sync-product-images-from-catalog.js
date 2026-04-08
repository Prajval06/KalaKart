'use strict';


const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/product.model');
require('../models/category.model');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/kalakart';
const BACKEND_CATALOG_PATH = path.resolve(__dirname, '../../data/kalakart_artisan_products.json');
const FRONTEND_PRODUCTS_PATH = path.resolve(__dirname, '../../../Frontend/src/data/products.ts');

const STOPWORDS = new Set([
  'and', 'with', 'set', 'setof', 'of', 'the', 'a', 'an', 'for', 'in', 'on', 'by', 'from',
  'pcs', 'piece', 'pieces', 'pack', 'large', 'small', 'handmade', 'handcrafted', 'traditional',
]);

const CATEGORY_KEYWORDS = {
  'pottery & ceramics': ['pottery', 'terracotta', 'clay', 'ceramic', 'ceramics', 'vase', 'pot', 'matka', 'planter', 'bowl', 'diya'],
  'textiles & fabrics': ['textile', 'textiles', 'fabric', 'fabrics', 'cotton', 'saree', 'stole', 'curtain', 'handloom', 'woven', 'weaving', 'block', 'print', 'dye', 'embroidered'],
  jewelry: ['jewelry', 'kundan', 'meenakari', 'necklace', 'bracelet', 'ring', 'bangle', 'tikka', 'jhumka', 'pendant', 'nose', 'haar'],
  'art & paintings': ['art', 'painting', 'paintings', 'mandala', 'miniature', 'canvas', 'print', 'portrait', 'wall'],
  'home decor': ['home', 'decor', 'wood', 'wooden', 'brass', 'metal', 'clock', 'bell', 'figurine', 'box', 'panel', 'hanging', 'lamp', 'frame'],
  clothing: ['clothing', 'kurta', 'saree', 'stole', 'dress', 'fabric', 'handloom', 'woven'],
  'crafts & weaving': ['craft', 'weaving', 'woven', 'jute', 'basket', 'loom', 'grass', 'fiber'],
};

const MANUAL_FALLBACK_BY_PRODUCT = {
  'meenakari ring': 'Kundan Jewelry Set',
  'meenakari bangle set (6 pcs)': 'Temple Gold Necklace',
  'meenakari jhumka earrings': 'Oxidised Silver Anklet',
  'block print tote bag': 'Block Print Cushion Cover Set',
  'block print table runner': 'Block Print Curtain Panel',
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !STOPWORDS.has(item));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
}

function loadBackendCatalogSources() {
  const entries = JSON.parse(fs.readFileSync(BACKEND_CATALOG_PATH, 'utf8'));
  return entries
    .filter((entry) => entry.image_url && !String(entry.image_url).includes('source.unsplash.com'))
    .map((entry) => ({
      source: 'backend-catalog',
      name: entry.product_name,
      category: entry.category,
      url: entry.image_url,
      id: `backend:${slugify(entry.product_name)}`,
    }));
}

function loadFrontendCatalogSources() {
  const raw = fs.readFileSync(FRONTEND_PRODUCTS_PATH, 'utf8');
  const pattern = /\{\s*id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'[\s\S]*?\}/g;
  const sources = [];

  for (const match of raw.matchAll(pattern)) {
    const [, id, name, category, url] = match;
    if (!url || String(url).includes('source.unsplash.com')) continue;

    sources.push({
      source: 'frontend-catalog',
      id: `frontend:${id}`,
      name,
      category,
      url,
    });
  }

  return sources;
}

function getCategoryKeywords(category) {
  const normalized = String(category || '').trim().toLowerCase();
  return CATEGORY_KEYWORDS[normalized] || [];
}

function scoreSource(product, source) {
  const productTokens = new Set(normalizeText([product.name, product.categoryName, product.artisanName, product.specialty].join(' ')));
  const sourceTokens = new Set(normalizeText([source.name, source.category].join(' ')));

  let score = 0;

  for (const token of productTokens) {
    if (sourceTokens.has(token)) {
      score += token.length >= 6 ? 8 : 5;
    }
  }

  for (const keyword of getCategoryKeywords(product.categoryName)) {
    if (sourceTokens.has(keyword)) {
      score += 4;
    }
  }

  const sourceTokensArray = Array.from(sourceTokens);
  const productTokensArray = Array.from(productTokens);

  if (productTokensArray.length > 0 && sourceTokensArray.length > 0) {
    if (sourceTokensArray[0] === productTokensArray[0]) {
      score += 4;
    }

    if (sourceTokensArray.some((token) => productTokensArray.includes(token))) {
      score += 2;
    }
  }

  return score;
}

function buildAssignments(products, sources) {
  const scoredProducts = products.map((product) => {
    const candidates = sources
      .map((source) => ({ source, score: scoreSource(product, source) }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score);

    return {
      product,
      candidates,
      rank: candidates.length,
    };
  });

  scoredProducts.sort((left, right) => {
    if (left.rank !== right.rank) return left.rank - right.rank;
    return String(left.product.name).localeCompare(String(right.product.name));
  });

  const usedUrls = new Set();
  const assignments = [];

  for (const item of scoredProducts) {
    const fallbackName = MANUAL_FALLBACK_BY_PRODUCT[String(item.product.name || '').trim().toLowerCase()];
    if (!fallbackName) continue;

    const fallbackSource = sources.find((source) => source.name === fallbackName && !usedUrls.has(source.url));
    if (!fallbackSource) continue;

    usedUrls.add(fallbackSource.url);
    assignments.push({ product: item.product, source: fallbackSource });
    item.assigned = true;
  }

  for (const item of scoredProducts) {
    if (item.assigned) continue;

    const candidate = item.candidates.find(({ source }) => !usedUrls.has(source.url));

    if (candidate) {
      usedUrls.add(candidate.source.url);
      assignments.push({ product: item.product, source: candidate.source });
      continue;
    }

    assignments.push({ product: item.product, source: null });
  }

  return assignments;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Mongo connected');

  const sources = [...loadBackendCatalogSources(), ...loadFrontendCatalogSources()];
  const products = await Product.find({ isAvailable: true })
    .populate('category', 'name')
    .sort({ createdAt: -1 });

  const assignments = buildAssignments(products.map((product) => ({
    id: product._id,
    name: product.name,
    categoryName: product.category?.name || '',
    artisanName: product.artisanName || '',
    specialty: product.specialty || '',
  })), sources);

  let updated = 0;
  let skipped = 0;

  const productById = new Map(products.map((product) => [String(product._id), product]));

  for (const assignment of assignments) {
    const product = productById.get(String(assignment.product.id));
    if (!product || !assignment.source) {
      skipped += 1;
      continue;
    }

    product.imageUrl = assignment.source.url;
    product.images = [assignment.source.url];
    product.imageProvider = assignment.source.source;
    product.imageProviderId = assignment.source.id;
    product.imageAttribution = null;
    product.imageUpdatedAt = new Date();

    await product.save();
    updated += 1;
  }

  console.log(`✅  Sources available: ${sources.length}`);
  console.log(`✅  Products scanned: ${products.length}`);
  console.log(`✅  Products updated: ${updated}`);
  console.log(`✅  Products skipped: ${skipped}`);

  await mongoose.disconnect();
  console.log('✅  Mongo disconnected');
}

run().catch(async (error) => {
  console.error('❌  Image sync failed:', error.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});