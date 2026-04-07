const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { getRecommendations } = require('../utils/mlclient');

const getProducts = asyncHandler(async (req, res) => {
  const { page, per_page, category, search, min_price, max_price, sort } = req.query;
  const result = await productService.getProducts({
    page, per_page, category, search, min_price, max_price, sort,
  });
  return success(res, { products: result.products }, 200, result.meta);
});

const getProductByIdentifier = asyncHandler(async (req, res) => {
  const product = await productService.getProductByIdentifier(req.params.identifier);

  let recommended = [];
  try {
    recommended = await getRecommendations(product.id);
  } catch (_) {
    recommended = [];
  }

  return success(res, {
    product,
    recommended_product_ids: recommended,
  });
});

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await productService.getCategories();
  return success(res, { categories });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return success(res, { product }, 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.productId, req.body);
  return success(res, { product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.productId);
  return success(res, { message: 'Product deactivated successfully' });
});

module.exports = {
  getProducts,
  getProductByIdentifier,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};