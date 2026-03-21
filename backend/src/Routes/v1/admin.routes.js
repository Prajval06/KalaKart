const router   = require('express').Router();
const { getAllOrders, updateOrderStatus } = require('../../controller/order.controller');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');

// All admin routes require auth + admin role
router.use(protect, isAdmin);

router.get('/orders',                      getAllOrders);
router.patch('/orders/:orderId/status',    updateOrderStatus);

module.exports = router;