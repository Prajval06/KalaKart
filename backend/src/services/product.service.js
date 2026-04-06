const mongoose = require('mongoose');
const Product  = require('../models/product.model');
const Category = require('../models/category.model');
const AppError = require('../utils/AppError');

const getProducts = async ({ page = 1, per_page = 20, category, search, min_price, max_price, sort = 'newest' }) => {
  const filter = { isAvailable: true };

  // Category filter
  if (category) {
    const cat = await Category.findOne({ slug: category, is_active: true });
    if (cat) filter.category = cat._id;
  }

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  if (min_price !== undefined || max_price !== undefined) {
    filter.price = {};
    if (min_price !== undefined) filter.price.$gte = parseInt(min_price);
    if (max_price !== undefined) filter.price.$lte = parseInt(max_price);
  }

  const sortMap = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const skip  = (page - 1) * per_page;
  const limit = Math.min(parseInt(per_page), 100);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  const transformed = products.map((p) => ({
    ...p,
    id:       p._id.toString(),
    category: p.category?.toString(),
    _id:      undefined,
    __v:      undefined,
  }));

  return {
    products: transformed,
    meta: {
      page:        parseInt(page),
      per_page:    limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Flexible product lookup:
 * 1) slug
 * 2) _id (only when identifier is valid ObjectId)
 * 3) legacy id string (temporary compatibility)
 */
const getProductByIdentifier = async (identifier) => {
  let product = null;

  // 1) slug lookup
  product = await Product.findOne({ slug: identifier, isAvailable: true }).lean();

  // 2) _id lookup only if valid ObjectId
  if (!product && mongoose.Types.ObjectId.isValid(identifier)) {
    product = await Product.findOne({ _id: identifier, isAvailable: true }).lean();
  }

  // 3) legacy id fallback (if you still store old mock ids in `id`)
  if (!product) {
    product = await Product.findOne({ id: identifier, isAvailable: true }).lean();
  }

  if (!product) throw AppError.create('PRODUCT_NOT_FOUND');

  return {
    ...product,
    id:       product._id.toString(),
    category: product.category?.toString(),
    _id:      undefined,
    __v:      undefined,
  };
};

const getCategories = async () => {
  return Category.find({ is_active: true }).sort({ display_order: 1 });
};

const createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

const updateProduct = async (productId, updates) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    updates,
    { new: true }
  );
  if (!product) throw AppError.create('PRODUCT_NOT_FOUND');
  return product;
};

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isAvailable: false },
    { new: true }
  );
  if (!product) throw AppError.create('PRODUCT_NOT_FOUND');
  return product;
};

module.exports = {
  getProducts,
  getProductByIdentifier,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};