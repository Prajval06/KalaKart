const router     = require('express').Router();
const controller = require('../../controllers/order.controller');
const protect    = require('../../middlewares/auth.middleware');

// All order routes require authentication
router.use(protect);

router.post('/',             controller.createOrder);
router.get('/',              controller.getMyOrders);
router.get('/:orderId',      controller.getOrderById);

module.exports = router;