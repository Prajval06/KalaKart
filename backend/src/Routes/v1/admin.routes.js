const router            = require('express').Router();
const orderController   = require('../../controller/order.controller');
const productController = require('../../controller/product.controller');
const protect           = require('../../middlewares/auth.middleware');
const adminOnly         = require('../../middlewares/admin.middleware');
const validate          = require('../../middlewares/validate.middleware');
const orderSchemas      = require('../../validators/order.validators');
const productSchemas    = require('../../validators/product.validators');

router.use(protect, adminOnly);

// Orders
router.get('/orders',
  orderController.getAllOrders
);
router.patch('/orders/:orderId/status',
  validate(orderSchemas.updateStatus),
  orderController.updateOrderStatus
);

// Products
router.post('/products',
  validate(productSchemas.createProduct),
  productController.createProduct
);
router.patch('/products/:productId',
  validate(productSchemas.updateProduct),
  productController.updateProduct
);
router.delete('/products/:productId',
  productController.deleteProduct
);

module.exports = router;