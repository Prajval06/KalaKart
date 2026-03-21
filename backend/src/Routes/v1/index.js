const router = require('express').Router();

router.use('/auth',       require('./auth.routes'));
router.use('/users',      require('./user.routes'));
router.use('/products',   require('./product.routes'));
router.use('/cart',       require('./cart.routes'));
router.use('/orders',     require('./order.routes'));
router.use('/payment',    require('./payment.routes'));
router.use('/categories', require('./category.routes'));
router.use('/admin',      require('./admin.routes'));

module.exports = router;