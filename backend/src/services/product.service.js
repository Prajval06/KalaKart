const mongoose = require('mongoose');
const Product = require('../models/product.model'); // keep ONLY the correct one for your repo
const Category = require('../models/category.model');
const AppError = require('../utils/AppError');

const getProducts = async ({
  page = 1,
  per_page = 20,
  category,
  search,
  min_price,
  max_price,
  sort = 'newest',
}) => {
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
    if (min_price !== undefined) filter.price.$gte = parseInt(min_price, 10);
    if (max_price !== undefined) filter.price.$lte = parseInt(max_price, 10);
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const pageNum = parseInt(page, 10) || 1;
  const perPageNum = Math.min(parseInt(per_page, 10) || 20, 100);
  const skip = (pageNum - 1) * perPageNum;

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug display_order').sort(sortOption).skip(skip).limit(perPageNum).lean(),
    Product.countDocuments(filter),
  ]);

  const transformed = products.map((p) => ({
    ...p,
    id: p._id?.toString?.() || '',
    category: p.category?.name || p.category?.toString?.() || '',
    categorySlug: p.category?.slug || '',
    _id: undefined,
    __v: undefined,
  }));

  return {
    products: transformed,
    meta: {
      page: pageNum,
      per_page: perPageNum,
      total,
      total_pages: Math.ceil(total / perPageNum),
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
  const key = decodeURIComponent(String(identifier || '')).trim();
  if (!key) throw AppError.create('PRODUCT_NOT_FOUND');

  let product = await Product.findOne({ slug: key, isAvailable: true }).populate('category', 'name slug display_order').lean();

  if (!product && mongoose.Types.ObjectId.isValid(key)) {
    product = await Product.findOne({ _id: key, isAvailable: true }).populate('category', 'name slug display_order').lean();
  }

  if (!product) {
    product = await Product.findOne({ id: key, isAvailable: true }).populate('category', 'name slug display_order').lean();
  }

  if (!product) throw AppError.create('PRODUCT_NOT_FOUND');

  return {
    ...product,
    id: product._id?.toString?.() || '',
    category: product.category?.name || product.category?.toString?.() || '',
    categorySlug: product.category?.slug || '',
    _id: undefined,
    __v: undefined,
  };
};

const getCategories = async () => {
  return Category.find({ is_active: true }).sort({ display_order: 1 });
};

const createProduct = async (data) => {
  return Product.create(data);
};

const updateProduct = async (productId, updates) => {
  const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
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