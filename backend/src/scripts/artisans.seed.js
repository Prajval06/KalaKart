'use strict';

/**
 * artisans.seed.js
 * ─────────────────────────────────────────────────────────────────
 * Creates 7 Indian artisan user accounts in MongoDB.
 *
 * Usage:
 *   node src/scripts/artisans.seed.js
 *   (from backend/ directory — ensure .env is present)
 * ─────────────────────────────────────────────────────────────────
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URL;

if (!MONGO_URI) {
  console.error('❌  MONGO_URI not found in .env');
  process.exit(1);
}

// ── Inline schemas (mirror models) ────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    hashed_password: { type: String, required: false, select: false },
    full_name:       { type: String, required: true, trim: true },
    role:            { type: String, enum: ['customer', 'admin', 'artisan'], default: 'customer' },
    is_active:       { type: Boolean, default: true },
    googleId:        { type: String, unique: true, sparse: true },
    profileImage:    { type: String },
    authMethod:      { type: String, enum: ['email', 'google'], default: 'email' },
    // Extra artisan profile fields (optional, stored for display)
    specialty:       { type: String },
    location:        { type: String },
    bio:             { type: String },
    yearsOfExperience: { type: Number, default: 0 },
    wishlist:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema({
  artisanName: { type: String, required: true },
  artisan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
}, { strict: false });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
}, { strict: false });

// Bcrypt hook — same as production model
userSchema.pre('save', async function (next) {
  if (!this.isModified('hashed_password')) return next();
  this.hashed_password = await bcrypt.hash(this.hashed_password, 12);
  next();
});

// Use existing model if already registered (hot-reload safety)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// ── Artisan data ──────────────────────────────────────────────────
const ARTISANS = [
  {
    full_name:    'Ramesh Kumar',
    email:        'ramesh@kalakart.com',
    specialty:    'Terracotta & Blue Pottery',
    location:     'Khurja, Uttar Pradesh',
    yearsOfExperience: 14,
    bio:          'Third-generation potter crafting terracotta and blue pottery inspired by regional motifs and natural pigments.',
    profileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name:    'Meera Devi',
    email:        'meera@kalakart.com',
    specialty:    'Block Printing & Natural Dyes',
    location:     'Sanganer, Rajasthan',
    yearsOfExperience: 11,
    bio:          'Master block printer using hand-carved stamps and natural dyes to produce heritage-inspired textile work.',
    profileImage: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name:    'Anjali Patel',
    email:        'anjali@kalakart.com',
    specialty:    'Miniature & Mandala Paintings',
    location:     'Pune, Maharashtra',
    yearsOfExperience: 9,
    bio:          'Artist blending miniature precision with mandala compositions to create expressive handcrafted wall pieces.',
    profileImage: 'https://images.unsplash.com/photo-1606406054219-619c4c2e2100?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name:    'Vikram Joshi',
    email:        'vikram@kalakart.com',
    specialty:    'Brass Metalwork',
    location:     'Moradabad, Uttar Pradesh',
    yearsOfExperience: 13,
    bio:          'Fourth-generation brass artisan creating ritual and decor metalwork with engraved and cast techniques.',
    profileImage: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name:    'Priya Singh',
    email:        'priya@kalakart.com',
    specialty:    'Natural Fiber Weaving',
    location:     'Guwahati, Assam',
    yearsOfExperience: 8,
    bio:          'Natural fiber weaving specialist creating practical and decorative handcrafted products from jute, cane, and cotton.',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name:    'Arjun Sharma',
    email:        'arjun@kalakart.com',
    specialty:    'Intricate Wood Carving',
    location:     'Mysuru, Karnataka',
    yearsOfExperience: 12,
    bio:          'Wood carving artisan specializing in carved home decor pieces with floral, temple, and geometric motifs.',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name:    'Lakshmi Nair',
    email:        'lakshmi@kalakart.com',
    specialty:    'Kundan & Meenakari Jewelry',
    location:     'Jaipur, Rajasthan',
    yearsOfExperience: 10,
    bio:          'Jewelry artisan crafting kundan and meenakari designs with traditional settings for festive and bridal collections.',
    profileImage: 'https://images.unsplash.com/photo-1614436163996-25cee5f54290?auto=format&fit=crop&w=400&h=400&q=80',
  },
];

const CATEGORY_ARTISANS = [
  {
    full_name: 'Aarav Potter',
    email: 'aarav.potter@kalakart.com',
    specialty: 'Pottery & Ceramics',
    location: 'Jaipur, Rajasthan',
    yearsOfExperience: 12,
    bio: 'Specialist in handcrafted pottery and terracotta decor for modern and traditional homes.',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name: 'Naina Weaves',
    email: 'naina.weaves@kalakart.com',
    specialty: 'Textiles & Fabrics',
    location: 'Kolkata, West Bengal',
    yearsOfExperience: 10,
    bio: 'Creates handcrafted textile and fabric products using traditional weaving and dye methods.',
    profileImage: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name: 'Ritvik Jewels',
    email: 'ritvik.jewels@kalakart.com',
    specialty: 'Jewelry',
    location: 'Jaipur, Rajasthan',
    yearsOfExperience: 9,
    bio: 'Designs handcrafted jewelry inspired by classic Indian craft traditions and festive aesthetics.',
    profileImage: 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name: 'Ishita Arts',
    email: 'ishita.arts@kalakart.com',
    specialty: 'Art & Paintings',
    location: 'Indore, Madhya Pradesh',
    yearsOfExperience: 8,
    bio: 'Produces hand-painted art and decor with mandala, miniature, and contemporary folk influences.',
    profileImage: 'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name: 'Kabir Looms',
    email: 'kabir.looms@kalakart.com',
    specialty: 'Clothing',
    location: 'Varanasi, Uttar Pradesh',
    yearsOfExperience: 11,
    bio: 'Crafts handloom clothing and wearable textiles with comfort-focused traditional craftsmanship.',
    profileImage: 'https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name: 'Mira Decor',
    email: 'mira.decor@kalakart.com',
    specialty: 'Home Decor',
    location: 'Mysuru, Karnataka',
    yearsOfExperience: 13,
    bio: 'Builds handcrafted home decor collections blending woodwork, metalwork, and artisanal utility pieces.',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    full_name: 'Dev Craftworks',
    email: 'dev.craftworks@kalakart.com',
    specialty: 'Crafts & Weaving',
    location: 'Guwahati, Assam',
    yearsOfExperience: 7,
    bio: 'Focuses on handcrafted weaving and natural-material craft products for everyday lifestyle use.',
    profileImage: 'https://images.unsplash.com/photo-1584999734482-0361aecad844?auto=format&fit=crop&w=400&h=400&q=80',
  },
];

const CATEGORY_ARTISAN_BY_CATEGORY = {
  pottery: 'Aarav Potter',
  clothing: 'Kabir Looms',
  'home decor': 'Mira Decor',
  'textile and fabrics': 'Naina Weaves',
  'textiles and fabrics': 'Naina Weaves',
  jewellery: 'Ritvik Jewels',
  jewelry: 'Ritvik Jewels',
  'art and paintings': 'Ishita Arts',
  'crafts and weaving': 'Dev Craftworks',
  'pottery & ceramics': 'Aarav Potter',
  'textiles & fabrics': 'Naina Weaves',
  'art & paintings': 'Ishita Arts',
  'crafts & weaving': 'Dev Craftworks',
  handmade: 'Dev Craftworks',
};

// ── Seed function ─────────────────────────────────────────────────
const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB →', MONGO_URI);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const artisanByName = new Map();

  for (const artisan of ARTISANS) {
    let user = await User.findOne({ email: artisan.email }).select('+hashed_password');

    if (!user) {
      user = new User({
        ...artisan,
        role: 'artisan',
        is_active: true,
        authMethod: 'email',
        hashed_password: 'Password@123',
      });
      await user.save();
      created++;
      console.log(`✅  Created → ${artisan.full_name} <${artisan.email}>`);
    } else {
      user.full_name = artisan.full_name;
      user.role = 'artisan';
      user.is_active = true;
      user.authMethod = user.authMethod || 'email';
      user.specialty = artisan.specialty;
      user.location = artisan.location;
      user.bio = artisan.bio;
      user.yearsOfExperience = artisan.yearsOfExperience;
      user.profileImage = artisan.profileImage;
      user.hashed_password = 'Password@123';
      await user.save();
      updated++;
      console.log(`🔄  Updated → ${artisan.full_name} <${artisan.email}>`);
    }

    artisanByName.set(artisan.full_name, user);
  }

  // Disable old artisan users not in the new curated list.
  const categoryCreatedByName = new Map();

  for (const artisan of CATEGORY_ARTISANS) {
    let user = await User.findOne({ email: artisan.email }).select('+hashed_password');

    if (!user) {
      user = new User({
        ...artisan,
        role: 'artisan',
        is_active: true,
        authMethod: 'email',
        hashed_password: 'Password@123',
      });
      await user.save();
      created++;
      console.log(`✅  Created category artisan → ${artisan.full_name} <${artisan.email}>`);
    } else {
      user.full_name = artisan.full_name;
      user.role = 'artisan';
      user.is_active = true;
      user.authMethod = user.authMethod || 'email';
      user.specialty = artisan.specialty;
      user.location = artisan.location;
      user.bio = artisan.bio;
      user.yearsOfExperience = artisan.yearsOfExperience;
      user.profileImage = artisan.profileImage;
      user.hashed_password = 'Password@123';
      await user.save();
      updated++;
      console.log(`🔄  Updated category artisan → ${artisan.full_name} <${artisan.email}>`);
    }

    categoryCreatedByName.set(artisan.full_name, user);
  }

  const activeEmails = [...ARTISANS.map((artisan) => artisan.email), ...CATEGORY_ARTISANS.map((artisan) => artisan.email)];
  const disableResult = await User.updateMany(
    { role: 'artisan', email: { $nin: activeEmails }, is_active: true },
    { $set: { is_active: false } }
  );

  const dbProducts = await Product.find({ isAvailable: true })
    .select('artisanName artisan_id category');

  const categoryIds = Array.from(new Set(
    dbProducts
      .map((product) => String(product.category || '').trim())
      .filter(Boolean)
  ));
  const categories = await Category.find({ _id: { $in: categoryIds } }).select('name');
  const categoryNameById = new Map(categories.map((category) => [String(category._id), String(category.name || '')]));
  let productLinked = 0;
  let productUnchanged = 0;

  for (const product of dbProducts) {
    const categoryKey = String(categoryNameById.get(String(product.category || '')) || '')
      .trim()
      .toLowerCase();
    const mappedName = CATEGORY_ARTISAN_BY_CATEGORY[categoryKey];
    const artisanUser = mappedName ? categoryCreatedByName.get(mappedName) : null;

    if (!artisanUser) {
      productUnchanged++;
      continue;
    }

    const nextArtisanId = artisanUser._id;
    const needsNameUpdate = product.artisanName !== mappedName;
    const needsIdUpdate = String(product.artisan_id || '') !== String(nextArtisanId);

    if (!needsNameUpdate && !needsIdUpdate) {
      productUnchanged++;
      continue;
    }

    product.artisanName = mappedName;
    product.artisan_id = nextArtisanId;
    await product.save();
    productLinked++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Artisan seed complete — ${created} created, ${updated} updated, ${skipped} skipped`);
  console.log(`✅  Products linked to artisans — ${productLinked} updated, ${productUnchanged} unchanged`);
  console.log(`✅  Old artisan accounts disabled — ${disableResult.modifiedCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Default password for all curated artisans → Password@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Artisan seed failed:', err.message);
  process.exit(1);
});
