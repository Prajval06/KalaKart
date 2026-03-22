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

const getProductById = async (id) => {
  const product = await Product.findOne({ _id: id, isAvailable: true }).lean();
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
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};