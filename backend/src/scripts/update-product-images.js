'use strict';

const mongoose = require('mongoose');
const { refreshProductImages } = require('../services/product-image.service');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/kalakart';
const IMAGE_PROVIDER = (process.env.IMAGE_PROVIDER || 'unsplash').toLowerCase();
const IMAGE_PROVIDER_ORDER = String(process.env.IMAGE_PROVIDER_ORDER || '')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const LIMIT = Number(process.env.IMAGE_UPDATE_LIMIT || 200);
const DELAY_MS = Number(process.env.IMAGE_UPDATE_DELAY_MS || 400);
const OVERWRITE_EXISTING = String(process.env.IMAGE_OVERWRITE || 'false').toLowerCase() === 'true';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log(`✅ Mongo connected (${IMAGE_PROVIDER})`);

  const result = await refreshProductImages({
    provider: IMAGE_PROVIDER,
    providerOrder: IMAGE_PROVIDER_ORDER.length > 0 ? IMAGE_PROVIDER_ORDER : undefined,
    limit: LIMIT,
    overwrite: OVERWRITE_EXISTING,
    delayMs: DELAY_MS,
  });

  console.log(`🔄 Scanned ${result.scanned} products`);
  console.log(`✅ Done. Updated=${result.updated}, Skipped=${result.skipped}, Failed=${result.failed}`);
  await mongoose.disconnect();
  console.log('✅ Mongo disconnected');
}

run().catch(async (error) => {
  console.error('❌ Image update script failed:', error.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
