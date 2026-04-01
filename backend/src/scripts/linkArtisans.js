const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const linkArtisans = async () => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({ artisan_id: { $exists: false } });
    console.log(`Found ${products.length} products to link.`);

    let updatedCount = 0;
    for (const product of products) {
      // Look for a user with the same name and role 'artisan'
      const artisan = await User.findOne({
        full_name: product.artisanName,
        role: 'artisan'
      });

      if (artisan) {
        product.artisan_id = artisan._id;
        await product.save();
        updatedCount++;
        console.log(`Linked product "${product.name}" to artisan "${artisan.full_name}"`);
      } else {
        console.log(`⚠️ No artisan found for product "${product.name}" with name "${product.artisanName}"`);
      }
    }

    console.log(`✅ Finished! Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error linking artisans:', err);
    process.exit(1);
  }
};

linkArtisans();
