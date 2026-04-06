const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/kalakart';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function upsertCategory(name, slug) {
  let cat = await Category.findOne({ slug });
  if (!cat) {
    cat = await Category.create({
      name,
      slug,
      is_active: true,
      display_order: 1,
    });
  }
  return cat;
}

async function run() {
  await mongoose.connect(MONGODB_URL);
  console.log('✅ Mongo connected');

  // 1) ensure at least one category exists
  const handmadeCat = await upsertCategory('Handmade', 'handmade');

  // 2) seed products (replace with your mock dataset later)
  const seedProducts = [
    {
      name: 'Handwoven Cotton Saree',
      slug: 'handwoven-cotton-saree',
      description: 'Traditional handwoven saree made by local artisans.',
      price: 2499,
      stock: 25,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
      category: handmadeCat._id,
      artisanName: 'Meera Crafts',
      specialty: 'Handloom Weaving',
      tags: ['saree', 'handloom', 'cotton'],
      isAvailable: true,
    },
    {
      name: 'Terracotta Clay Pot Set',
      slug: 'terracotta-clay-pot-set',
      description: 'Eco-friendly handcrafted terracotta pot set.',
      price: 899,
      stock: 40,
      images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa'],
      category: handmadeCat._id,
      artisanName: 'Ravi Pottery',
      specialty: 'Terracotta',
      tags: ['pottery', 'home-decor'],
      isAvailable: true,
    },
    {
      name: 'Wood Carved Elephant Decor',
      slug: 'wood-carved-elephant-decor',
      description: 'Intricately carved wooden elephant for decor.',
      price: 1599,
      stock: 15,
      images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4'],
      category: handmadeCat._id,
      artisanName: 'Kiran Woodworks',
      specialty: 'Wood Carving',
      tags: ['wood', 'decor', 'art'],
      isAvailable: true,
    },
  ];

  for (const p of seedProducts) {
    const slug = p.slug || slugify(p.name);

    await Product.findOneAndUpdate(
      { slug }, // idempotent by slug
      { ...p, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const total = await Product.countDocuments({ isAvailable: true });
  console.log(`✅ Seed complete. Available products: ${total}`);

  await mongoose.disconnect();
  console.log('✅ Mongo disconnected');
}

run().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});