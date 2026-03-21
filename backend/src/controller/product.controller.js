const productService = require('../services/product.services');
const asyncHandler   = require('../utils/asyncHandler');
const { success }    = require('../utils/response');

const getProducts = asyncHandler(async (req, res) => {
  const { page, per_page, category, search, min_price, max_price, sort } = req.query;
  const result = await productService.getProducts({
    page, per_page, category, search, min_price, max_price, sort,
  });
  return success(res, { products: result.products }, 200, result.meta);
});

const { getRecommendations } = require('../utils/mlClient');

const getProductBySlug = asyncHandler(async (req, res) => {
  const product     = await productService.getProductBySlug(req.params.slug);
  const recommended = await getRecommendations(product.id);

  return success(res, {
    product,
    recommended_product_ids: recommended,
  });
});
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  return success(res, { categories });
});

module.exports = { getProducts, getProductBySlug, getCategories };