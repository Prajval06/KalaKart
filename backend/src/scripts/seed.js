'use strict';

/**
 * seed.js — KalaKart database seeder
 * ────────────────────────────────────────────────────────────────
 * Creates categories, handmade art products (artisan marketplace),
 * and an admin account.
 *
 * Usage:
 *   node src/scripts/seed.js
 *   (run from backend/ with .env present)
 * ────────────────────────────────────────────────────────────────
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { loadCatalogEntries, buildSeedData } = require('../seeds/catalog.seed.helper');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URL;

if (!MONGO_URI) {
  console.error('❌  MONGO_URI not set in .env');
  process.exit(1);
}

// ── Schemas (mirrors actual models) ──────────────────────────────

const categorySchema = new mongoose.Schema({
  name:          { type: String, required: true },
  slug:          { type: String, required: true },
  display_order: { type: Number, default: 0 },
  is_active:     { type: Boolean, default: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, default: null },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },   // in ₹ (rupees)
  stock:       { type: Number, required: true, min: 0, default: 0 },
  images:      [{ type: String }],
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  artisanName: { type: String, required: true },
  specialty:   { type: String },
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  tags:        [{ type: String }],
  dateListed:  { type: Date, default: Date.now },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashed_password: { type: String, required: false, select: false },
  full_name:       { type: String, required: true, trim: true },
  role:            { type: String, enum: ['customer', 'admin', 'artisan'], default: 'customer' },
  is_active:       { type: Boolean, default: true },
  authMethod:      { type: String, enum: ['email', 'google'], default: 'email' },
  profileImage:    { type: String },
}, { timestamps: true });

// Bcrypt hook on userSchema
userSchema.pre('save', async function (next) {
  if (!this.isModified('hashed_password')) return next();
  this.hashed_password = await bcrypt.hash(this.hashed_password, 12);
  next();
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product  = mongoose.models.Product  || mongoose.model('Product',  productSchema);
const User     = mongoose.models.User     || mongoose.model('User',     userSchema);

// ── Seed ──────────────────────────────────────────────────────────

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected →', MONGO_URI);

  // Clear old seed data
  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({ role: 'admin' });
  console.log('🗑️   Cleared existing categories, products & admin users');

  // ── Categories & Products from JSON catalog ───────────────────
  const catalogEntries = loadCatalogEntries();
  const { categories: categoryPayload, products: productPayload } = buildSeedData(catalogEntries);

  await Category.insertMany(categoryPayload, { ordered: false });
  const categories = await Category.find({}).sort({ display_order: 1 });
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  const products = await Product.insertMany(
    productPayload.map((product) => ({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      category: categoryBySlug.get(product.categorySlug)?._id,
      artisanName: product.artisanName,
      specialty: product.specialty,
      rating: product.rating,
      numReviews: product.numReviews,
      isAvailable: product.isAvailable,
      tags: product.tags,
      dateListed: product.dateListed,
    })),
    { ordered: false }
  );
  console.log(`✅  ${categories.length} categories created`);
  console.log(`✅  ${products.length} products created from JSON catalog`);

  // ── Admin user ────────────────────────────────────────────────
  const existing = await User.findOne({ email: 'admin@kalakart.com' });
  if (!existing) {
    const admin = new User({
      email:           'admin@kalakart.com',
      hashed_password: 'admin123456',
      full_name:       'KalaKart Admin',
      role:            'admin',
      is_active:       true,
      authMethod:      'email',
    });
    await admin.save();
    console.log('✅  Admin user created → admin@kalakart.com / admin123456');
  } else {
    console.log('⏭️   Admin already exists — skipped');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅  Seed complete');
  console.log('────────────────────────────────────────────────────────');
  console.log('Admin login  →  admin@kalakart.com  /  admin123456');
  console.log('Categories   →  pottery, textiles, paintings, jewellery, block-printing');
  console.log(`Products     →  ${products.length} handmade art products`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  console.error(err);
  process.exit(1);
});