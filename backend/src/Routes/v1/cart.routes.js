const router     = require('express').Router();
const controller = require('../../controllers/cart.controller');
const protect    = require('../../middlewares/auth.middleware');

// All cart routes require authentication
router.use(protect);

router.get('/',                    controller.getCart);
router.post('/items',              controller.addItem);
router.patch('/items/:itemId',     controller.updateItem);
router.delete('/items/:itemId',    controller.removeItem);

module.exports = router;