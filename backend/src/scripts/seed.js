require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('❌ MONGODB_URL not found in .env');
  process.exit(1);
}

const categorySchema = new mongoose.Schema({
  name:          String,
  slug:          String,
  display_order: Number,
  is_active:     { type: Boolean, default: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:            String,
  slug:            String,
  description:     String,
  price:           Number,
  images:          [String],
  category_id:     mongoose.Schema.Types.ObjectId,
  tags:            [String],
  inventory_count: Number,
  is_active:       { type: Boolean, default: true },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email:            String,
  hashed_password:  String,
  full_name:        String,
  role:             { type: String, default: 'customer' },
  is_active:        { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Product  = mongoose.model('Product',  productSchema);
const User     = mongoose.model('User',     userSchema);

const seed = async () => {
  await mongoose.connect(MONGODB_URL);
  console.log('✅ Connected to MongoDB');

  // Clear existing seed data
  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({ role: 'admin' });
  console.log('🗑️  Cleared existing data');

  // Create categories
  const electronics = await Category.create({
    name: 'Electronics', slug: 'electronics', display_order: 1,
  });
  const clothing = await Category.create({
    name: 'Clothing', slug: 'clothing', display_order: 2,
  });
  const art = await Category.create({
    name: 'Art & Crafts', slug: 'art-crafts', display_order: 3,
  });
  console.log('✅ Categories created');

  // Create products — prices in paise (₹999 = 99900)
  const products = await Product.insertMany([
    {
      name:            'Wireless Headphones',
      slug:            'wireless-headphones',
      description:     'High quality wireless headphones with noise cancellation.',
      price:           299900,
      images:          ['https://picsum.photos/seed/headphones/400/400'],
      category_id:     electronics._id,
      tags:            ['audio', 'wireless'],
      inventory_count: 25,
    },
    {
      name:            'Mechanical Keyboard',
      slug:            'mechanical-keyboard',
      description:     'Tactile mechanical keyboard for developers.',
      price:           499900,
      images:          ['https://picsum.photos/seed/keyboard/400/400'],
      category_id:     electronics._id,
      tags:            ['keyboard', 'developer'],
      inventory_count: 10,
    },
    {
      name:            'Classic White T-Shirt',
      slug:            'classic-white-tshirt',
      description:     '100% cotton premium white t-shirt.',
      price:           79900,
      images:          ['https://picsum.photos/seed/tshirt/400/400'],
      category_id:     clothing._id,
      tags:            ['cotton', 'basics'],
      inventory_count: 100,
    },
    {
      name:            'Handmade Ceramic Mug',
      slug:            'handmade-ceramic-mug',
      description:     'Beautifully handcrafted ceramic mug.',
      price:           59900,
      images:          ['https://picsum.photos/seed/mug/400/400'],
      category_id:     art._id,
      tags:            ['handmade', 'ceramic'],
      inventory_count: 40,
    },
    {
      name:            'Bluetooth Speaker',
      slug:            'bluetooth-speaker',
      description:     'Portable waterproof bluetooth speaker.',
      price:           199900,
      images:          ['https://picsum.photos/seed/speaker/400/400'],
      category_id:     electronics._id,
      tags:            ['audio', 'portable'],
      inventory_count: 15,
    },
  ]);
  console.log(`✅ ${products.length} products created`);

  // Create admin user — password stored as plain text here
  // Your User model pre-save hook will hash it if it exists
  // If not we store it directly (update this if your model hashes it)
  await User.create({
    email:           'admin@kalakart.com',
    hashed_password: 'admin123456',
    full_name:       'Admin User',
    role:            'admin',
    is_active:       true,
  });
  console.log('✅ Admin user created');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seed complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin login → admin@kalakart.com / admin123456');
  console.log('\nProduct slugs:');
  products.forEach(p => console.log(`  ${p.slug}  →  ${p._id}`));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});