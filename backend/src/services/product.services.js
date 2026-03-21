const Product  = require('../models/product.model');
const Category = require('../models/category.model');
const AppError = require('../utils/AppError');

const getProducts = async ({ page = 1, per_page = 20, category, search, min_price, max_price, sort = 'newest' }) => {
  const filter = { is_active: true };

  // Category filter — find category by slug first
  if (category) {
    const cat = await Category.findOne({ slug: category, is_active: true });
    if (cat) filter.category_id = cat._id;
  }

  // Text search (uses MongoDB text index on name + description)
  if (search) {
    filter.$text = { $search: search };
  }

  // Price range — integers only
  if (min_price !== undefined || max_price !== undefined) {
    filter.price = {};
    if (min_price !== undefined) filter.price.$gte = parseInt(min_price);
    if (max_price !== undefined) filter.price.$lte = parseInt(max_price);
  }

  // Sort
  const sortMap = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const skip  = (page - 1) * per_page;
  const limit = Math.min(parseInt(per_page), 100); // max 100 per page

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  // Transform _id → id on lean results
  const transformed = products.map((p) => ({
    ...p,
    id:          p._id.toString(),
    category_id: p.category_id?.toString(),
    _id:         undefined,
    __v:         undefined,
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

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, is_active: true }).lean();
  if (!product) throw AppError.create('PRODUCT_NOT_FOUND');

  return {
    ...product,
    id:          product._id.toString(),
    category_id: product.category_id?.toString(),
    _id:         undefined,
    __v:         undefined,
  };
};

const getCategories = async () => {
  return Category.find({ is_active: true }).sort({ display_order: 1 });
};

module.exports = { getProducts, getProductBySlug, getCategories };