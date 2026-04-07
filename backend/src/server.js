const mongoose = require('mongoose');
const config   = require('./config/config');
const app      = require('./app');
const Product = require('./models/product.model');
const Category = require('./models/category.model');
const { seedCatalog } = require('./seeds/catalog.seed.helper');

const start = async () => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log('✅ MongoDB connected');

    const productCount = await Product.countDocuments({ isAvailable: true });
    if (productCount < 10) {
      const result = await seedCatalog({ Category, Product, clearExisting: false });
      console.log(`✅ Catalog seeded on startup: ${result.productsCount} products`);
    }
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed:', err.message);
    console.warn('⚠️  Server starting without database...');
  }

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  await mongoose.disconnect();
  process.exit(0);
});

start();