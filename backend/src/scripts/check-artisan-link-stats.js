'use strict';

const mongoose = require('mongoose');
const Product = require('../models/product.model');

const uri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/kalakart';

(async () => {
  await mongoose.connect(uri);

  const missingArtisanId = await Product.countDocuments({
    isAvailable: true,
    $or: [
      { artisan_id: { $exists: false } },
      { artisan_id: null },
    ],
  });

  const byArtisan = await Product.aggregate([
    { $match: { isAvailable: true } },
    { $group: { _id: '$artisanName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log(JSON.stringify({ missingArtisanId, byArtisan }, null, 2));

  await mongoose.disconnect();
})();
