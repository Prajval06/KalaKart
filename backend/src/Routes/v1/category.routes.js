const router     = require('express').Router();
const controller = require('../../controllers/product.controller');

router.get('/', controller.getCategories);

module.exports = router;