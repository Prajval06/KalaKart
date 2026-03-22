const router     = require('express').Router();
const controller = require('../../controller/cart.controller');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');
const validate   = require('../../middlewares/validate.middleware');
const schemas    = require('../../validators/cart.validators');

router.use(protect);

router.get('/',                 controller.getCart);
router.post('/items',           validate(schemas.addItem),    controller.addItem);
router.patch('/items/:itemId',  validate(schemas.updateItem), controller.updateItem);
router.delete('/items/:itemId',                               controller.removeItem);

module.exports = router;