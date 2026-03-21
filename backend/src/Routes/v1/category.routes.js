const router      = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const Category    = require('../../models/category.model');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ is_active: true }).sort({ display_order: 1 });
  return success(res, { categories });
}));

router.post('/', protect, isAdmin, asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return success(res, { category }, 201);
}));

module.exports = router;