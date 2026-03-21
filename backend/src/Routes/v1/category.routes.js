const router     = require('express').Router();
const controller = require('../../controller/product.controller');

router.get('/', controller.getCategories);

module.exports = router;