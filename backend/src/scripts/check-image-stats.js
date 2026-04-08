'use strict';

const mongoose = require('mongoose');
const Product = require('../models/product.model');

const uri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/kalakart';

(async () => {
  await mongoose.connect(uri);

  const total = await Product.countDocuments({ isAvailable: true });
  const imageUrl = await Product.countDocuments({ isAvailable: true, imageUrl: { $exists: true, $ne: '' } });
  const sourceUnsplash = await Product.countDocuments({ isAvailable: true, imageUrl: /source\.unsplash\.com/i });
  const providers = await Product.aggregate([
    { $match: { isAvailable: true } },
    { $group: { _id: '$imageProvider', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log(JSON.stringify({ total, imageUrl, sourceUnsplash, providers }, null, 2));

  await mongoose.disconnect();
})();
