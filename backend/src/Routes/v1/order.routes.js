const router = require('express').Router();
const {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus,
} = require('../../controller/order.controller');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');

router.use(protect);

router.post('/',                          createOrder);
router.get('/my',                         getMyOrders);
router.get('/admin',        isAdmin,      getAllOrders);
router.get('/:orderId',                   getOrderById);
router.patch('/:orderId/status', isAdmin, updateOrderStatus);

module.exports = router;