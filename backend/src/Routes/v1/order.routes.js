const router     = require('express').Router();
const controller = require('../../controller/order.controller');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');
const validate   = require('../../middlewares/validate.middleware');
const schemas    = require('../../validators/order.validators');

router.use(protect);

router.post('/',         validate(schemas.createOrder), controller.createOrder);
router.get('/',                                         controller.getMyOrders);
router.get('/:orderId',                                 controller.getOrderById);

module.exports = router;