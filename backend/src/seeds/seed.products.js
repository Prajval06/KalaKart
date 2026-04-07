const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { seedCatalog } = require('./catalog.seed.helper');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/kalakart';

async function run() {
  await mongoose.connect(MONGODB_URL);
  console.log('✅ Mongo connected');

  const result = await seedCatalog({ Category, Product, clearExisting: false });

  const total = await Product.countDocuments({ isAvailable: true });
  console.log(`✅ Seed complete. Categories: ${result.categoriesCount}, products upserted: ${result.productsCount}, available products: ${total}`);

  await mongoose.disconnect();
  console.log('✅ Mongo disconnected');
}

run().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});