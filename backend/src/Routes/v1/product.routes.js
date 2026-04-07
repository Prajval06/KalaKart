const router     = require('express').Router();
const controller = require('../../controller/product.controller');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');

// All public — no auth required
router.get('/', controller.getProducts);
router.get('/:identifier', controller.getProductByIdentifier);

module.exports = router;