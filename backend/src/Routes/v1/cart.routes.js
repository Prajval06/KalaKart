const router = require('express').Router();
const { getCart, addItem, updateItem, removeItem } = require('../../controller/cart.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/',                  getCart);
router.post('/',                 addItem);
router.put('/items/:itemId',     updateItem);
router.delete('/items/:itemId',  removeItem);

module.exports = router;