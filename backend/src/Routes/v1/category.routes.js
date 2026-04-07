const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const productService = require('../../services/product.service');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await productService.getCategories();
    return success(res, { categories });
  })
);

module.exports = router;