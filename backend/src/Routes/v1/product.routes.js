const router = require('express').Router();
const { getProducts, getProductBySlug, getCategories } = require('../../controller/product.controller');

// Public routes — no auth needed
router.get('/',          getProducts);
router.get('/categories', getCategories);
router.get('/:slug',     getProductBySlug);

module.exports = router;