const router     = require('express').Router();
const controller = require('../../controller/order.controller');
const protect    = require('../../middlewares/auth.middleware');
const adminOnly  = require('../../middlewares/admin.middleware');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/orders',                       controller.getAllOrders);
router.patch('/orders/:orderId/status',     controller.updateOrderStatus);

module.exports = router;