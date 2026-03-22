const router     = require('express').Router();
const controller = require('../../controller/product.controller');

// All public — no auth required
router.get('/',           controller.getProducts);
router.get('/:slug',      controller.getProductBySlug);

module.exports = router;