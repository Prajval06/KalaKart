const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/product.model');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const products = await Product.find({});
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    // Uses picsum.photos — gives different real image for each product
    p.images = [`https://picsum.photos/seed/${p._id}/600/600`];
    await p.save();
  }

  console.log(`✅ Updated images for ${products.length} products!`);
  process.exit(0);
});