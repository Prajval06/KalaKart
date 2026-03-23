const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/product.model');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Product.updateMany({}, {
    $set: { images: ['https://placehold.co/600x600/f5e6d3/8b4513?text=KalaKart'] }
  });
  console.log('✅ Images updated!');
  process.exit(0);
});