const mongoose = require('mongoose');
const fs       = require('fs');
const path     = require('path');
require('dotenv').config();

const Product  = require('./src/models/product.model');
const Category = require('./src/models/category.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kalakart';

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected for seeding...');

    const rawData = fs.readFileSync(
      path.join(__dirname, 'data', 'kalakart_artisan_products.json'),
      'utf-8'
    );
    const products = JSON.parse(rawData);
    console.log(`📦 Loaded ${products.length} products from JSON`);

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const uniqueCategories = [...new Set(products.map(p => p.category))];
    const categoryMap = {};
    for (const name of uniqueCategories) {
      const cat = await Category.create({
        name,
        slug:        name.toLowerCase().replace(/\s+/g, '-'),
        description: `Handcrafted ${name} by local Indian artisans`,
      });
      categoryMap[name] = cat._id;
      console.log(`  ✅ Category: ${name}`);
    }

    const mappedProducts = products.map(p => ({
      name:        p.product_name,
      description: p.description,
      price:       p.price,
      stock:       p.stock,
      images:      [p.image_url],
      category:    categoryMap[p.category],
      artisanName: p.seller,
      specialty:   p.seller_specialty,
      rating:      p.rating,
      numReviews:  0,
      isAvailable: p.stock > 0,
      tags:        p.category.toLowerCase().split(' '),
      dateListed:  new Date(p.date_listed),
    }));

    await Product.insertMany(mappedProducts);
    console.log(`\n🎉 Seeded ${mappedProducts.length} products successfully!`);

    const total = await Product.countDocuments();
    const cats  = await Category.countDocuments();
    console.log(`\n📊 Products: ${total} | Categories: ${cats}`);
    console.log('✅ Done! Run npm run dev to start server.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();