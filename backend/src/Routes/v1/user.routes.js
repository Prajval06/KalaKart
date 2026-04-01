const router = require('express').Router();
const { protect } = require('../../middlewares/auth.middleware');
const {
  getMe, updateMe, changePassword,
  toggleWishlist, getWishlist, getArtisans
} = require('../../controller/user.controller');

// Public routes
router.get('/artisans',              getArtisans);

router.use(protect);

router.get('/me',                    getMe);
router.put('/me',                    updateMe);
router.put('/change-password',       changePassword);
router.get('/wishlist',              getWishlist);
router.post('/wishlist/:productId',  toggleWishlist);

module.exports = router;