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

  // ── Categories ────────────────────────────────────────────────
  const pottery      = await Category.create({ name: 'Pottery & Ceramics',   slug: 'pottery-ceramics',   display_order: 1 });
  const textiles     = await Category.create({ name: 'Handloom & Textiles',  slug: 'handloom-textiles',  display_order: 2 });
  const paintings    = await Category.create({ name: 'Paintings & Art',      slug: 'paintings-art',      display_order: 3 });
  const jewellery    = await Category.create({ name: 'Jewellery & Metalwork',slug: 'jewellery-metalwork',display_order: 4 });
  const blockPrint   = await Category.create({ name: 'Block Printing',       slug: 'block-printing',     display_order: 5 });
  console.log('✅  5 categories created');

  // ── Products ──────────────────────────────────────────────────
  const products = await Product.insertMany([
    // Pottery
    {
      name:        'Blue Pottery Vase',
      slug:        'blue-pottery-vase',
      description: 'Handcrafted turquoise blue pottery vase from Jaipur, decorated with traditional floral patterns and fired at high temperature for durability.',
      price:       1299,
      stock:       15,
      images:      ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600'],
      category:    pottery._id,
      artisanName: 'Ramesh Kumar',
      specialty:   'Pottery',
      rating:      4.7,
      numReviews:  32,
      isAvailable: true,
      tags:        ['pottery', 'jaipur', 'blue-pottery', 'vase', 'home-decor'],
    },
    {
      name:        'Terracotta Wall Plate',
      slug:        'terracotta-wall-plate',
      description: 'Earthy terracotta wall plate with hand-painted geometric motifs, ideal for adding a rustic Indian aesthetic to your home.',
      price:       699,
      stock:       25,
      images:      ['https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?w=600'],
      category:    pottery._id,
      artisanName: 'Ramesh Kumar',
      specialty:   'Pottery',
      rating:      4.5,
      numReviews:  18,
      isAvailable: true,
      tags:        ['terracotta', 'wall-art', 'handmade', 'home-decor'],
    },

    // Textiles
    {
      name:        'Banarasi Silk Saree — Crimson Gold',
      slug:        'banarasi-silk-saree-crimson-gold',
      description: 'Authentic hand-woven Banarasi silk saree with intricate zari gold brocade work. Comes with matching blouse piece. A timeless heirloom.',
      price:       8500,
      stock:       5,
      images:      ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
      category:    textiles._id,
      artisanName: 'Priya Singh',
      specialty:   'Handloom Weaving',
      rating:      4.9,
      numReviews:  54,
      isAvailable: true,
      tags:        ['saree', 'banarasi', 'silk', 'wedding', 'zari'],
    },
    {
      name:        'Kerala Kasavu Cotton Saree',
      slug:        'kerala-kasavu-cotton-saree',
      description: 'Traditional ivory Kerala Kasavu saree with pure gold zari border, woven on handloom. Perfect for festivals and celebrations.',
      price:       3200,
      stock:       10,
      images:      ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600'],
      category:    textiles._id,
      artisanName: 'Lakshmi Nair',
      specialty:   'Kasavu Textiles',
      rating:      4.8,
      numReviews:  41,
      isAvailable: true,
      tags:        ['saree', 'kasavu', 'kerala', 'cotton', 'festival'],
    },

    // Paintings
    {
      name:        'Madhubani Fish Pair — Original',
      slug:        'madhubani-fish-pair-original',
      description: 'Original hand-painted Madhubani artwork on 12×16 handmade paper. Features the iconic fish pair motif symbolizing fertility and harmony.',
      price:       2400,
      stock:       8,
      images:      ['https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600'],
      category:    paintings._id,
      artisanName: 'Anjali Patel',
      specialty:   'Madhubani Paintings',
      rating:      4.9,
      numReviews:  27,
      isAvailable: true,
      tags:        ['madhubani', 'painting', 'original', 'folk-art', 'bihar'],
    },
    {
      name:        'Warli Village Scene Painting',
      slug:        'warli-village-scene-painting',
      description: 'Authentic Warli painting depicting village life — farmers, animals, and celebrations — done in traditional white pigment on mud-textured canvas.',
      price:       1800,
      stock:       12,
      images:      ['https://images.unsplash.com/photo-1599054802207-91d346adc120?w=600'],
      category:    paintings._id,
      artisanName: 'Anjali Patel',
      specialty:   'Tribal Art',
      rating:      4.6,
      numReviews:  19,
      isAvailable: true,
      tags:        ['warli', 'tribal', 'painting', 'folk-art', 'maharashtra'],
    },

    // Jewellery & Metalwork
    {
      name:        'Meenakari Silver Jhumka Earrings',
      slug:        'meenakari-silver-jhumka-earrings',
      description: 'Hand-crafted silver jhumka earrings with vibrant Meenakari enamel work in blue, green, and red. Lightweight with silver hooks.',
      price:       1650,
      stock:       20,
      images:      ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600'],
      category:    jewellery._id,
      artisanName: 'Arjun Sharma',
      specialty:   'Handcrafted Jewellery',
      rating:      4.8,
      numReviews:  63,
      isAvailable: true,
      tags:        ['jhumka', 'meenakari', 'silver', 'earrings', 'jaipur'],
    },
    {
      name:        'Dhokra Brass Elephant Sculpture',
      slug:        'dhokra-brass-elephant-sculpture',
      description: 'Lost-wax cast brass elephant figurine in the ancient Dhokra art style. Height 15cm. Solid, heavy and museum-quality.',
      price:       2100,
      stock:       7,
      images:      ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'],
      category:    jewellery._id,
      artisanName: 'Vikram Joshi',
      specialty:   'Brass Metalwork',
      rating:      4.7,
      numReviews:  35,
      isAvailable: true,
      tags:        ['dhokra', 'brass', 'elephant', 'sculpture', 'tribal-art'],
    },

    // Block Printing
    {
      name:        'Block-Printed Cotton Table Runner',
      slug:        'block-printed-cotton-table-runner',
      description: 'Hand block-printed 14×72 inch cotton table runner in deep indigo with floral motifs, using natural vegetable dyes. Machine washable.',
      price:       950,
      stock:       30,
      images:      ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
      category:    blockPrint._id,
      artisanName: 'Meera Devi',
      specialty:   'Block Printing',
      rating:      4.6,
      numReviews:  44,
      isAvailable: true,
      tags:        ['block-print', 'indigo', 'table-runner', 'cotton', 'home-decor'],
    },
    {
      name:        'Bagru Block-Print Cotton Kurta',
      slug:        'bagru-block-print-cotton-kurta',
      description: 'Men\'s handloom cotton kurta with authentic Bagru block print — geometric patterns in earthy terracotta and black on natural cotton ground.',
      price:       1400,
      stock:       18,
      images:      ['https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600'],
      category:    blockPrint._id,
      artisanName: 'Meera Devi',
      specialty:   'Block Printing',
      rating:      4.7,
      numReviews:  29,
      isAvailable: true,
      tags:        ['block-print', 'kurta', 'bagru', 'mens', 'cotton'],
    },
  ]);
  console.log(`✅  ${products.length} products created`);

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