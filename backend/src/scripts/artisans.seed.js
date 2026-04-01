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

// ── Inline User schema (mirrors user.model.js exactly) ───────────
// We re-define the schema here so the seed runs without importing
// the full app and triggering passport / other setup side-effects.
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
    wishlist:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Bcrypt hook — same as production model
userSchema.pre('save', async function (next) {
  if (!this.isModified('hashed_password')) return next();
  this.hashed_password = await bcrypt.hash(this.hashed_password, 12);
  next();
});

// Use existing model if already registered (hot-reload safety)
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ── Artisan data ──────────────────────────────────────────────────
const ARTISANS = [
  {
    full_name:    'Ramesh Kumar',
    email:        'ramesh.kumar@kalakart.com',
    specialty:    'Pottery',
    location:     'Khurja, Uttar Pradesh',
    bio:          'Third-generation potter crafting traditional blue pottery and terracotta art from the heart of UP. Each piece tells a story rooted in centuries of Indian soil.',
    profileImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
  },
  {
    full_name:    'Meera Devi',
    email:        'meera.devi@kalakart.com',
    specialty:    'Block Printing',
    location:     'Sanganer, Rajasthan',
    bio:          'Master block printer who hand-carves intricate wooden stamps and prints vibrant patterns on organic fabrics using natural, eco-friendly dyes.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  },
  {
    full_name:    'Vikram joshi',
    email:        'anjali.patel@kalakart.com',
    specialty:    'Madhubani Paintings',
    location:     'Madhubani, Bihar',
    bio:          'Award-winning Madhubani artist whose intricate paintings draw from Hindu mythology and nature, using bold geometric patterns and natural pigments on handmade paper.',
    profileImage: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400',
  },
  {
    full_name:    'Anjali patel',
    email:        'vikram.joshi@kalakart.com',
    specialty:    'Brass Metalwork',
    location:     'Moradabad, Uttar Pradesh',
    bio:          'Skilled dhokra craftsman who creates stunning lost-wax cast brass sculptures and decorative items, continuing a 4,000-year-old Indian tradition.',
    profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
  },
  {
    full_name:    'Suresh reddy',
    email:        'suresh.reddy@kalakart.com',
    specialty:    'Handloom Weaving',
    location:     'Varanasi, Uttar Pradesh',
    bio:          'Second-generation Banarasi silk weaver who creates exquisite zari brocade sarees on traditional pit looms, with patterns inspired by Mughal architecture.',
    profileImage: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
  },
  {
    full_name:    'Arjun Sharma',
    email:        'arjun.sharma@kalakart.com',
    specialty:    'Handcrafted Jewellery',
    location:     'Jaipur, Rajasthan',
    bio:          'Meenakari jewellery artist who paints intricate enamel designs on gold and silver, blending Mughal and Rajput influences into wearable art pieces.',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    full_name:    'Lakshmi Nair',
    email:        'lakshmi.nair@kalakart.com',
    specialty:    'Kasavu Textiles',
    location:     'Thrissur, Kerala',
    bio:          'Expert in traditional Kerala Kasavu weaving, creating handloom sarees with pure gold-zari borders. Her work preserves the rich textile heritage of God\'s Own Country.',
    profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400',
  },
];

// ── Seed function ─────────────────────────────────────────────────
const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB →', MONGO_URI);

  let created = 0;
  let skipped = 0;

  for (const artisan of ARTISANS) {
    const exists = await User.findOne({ email: artisan.email });

    if (exists) {
      console.log(`⏭️   Skipped  (already exists) → ${artisan.full_name} <${artisan.email}>`);
      skipped++;
      continue;
    }

    const user = new User({
      ...artisan,
      role:            'artisan',
      is_active:       true,
      authMethod:      'email',
      hashed_password: 'Kalakart@2024', // will be hashed by pre-save hook
    });

    await user.save();
    console.log(`✅  Created  → ${artisan.full_name} (${artisan.specialty}) — ${artisan.location}`);
    created++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Artisan seed complete — ${created} created, ${skipped} skipped`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Default password for all artisans → Kalakart@2024');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Artisan seed failed:', err.message);
  process.exit(1);
});
