const router = require('express').Router();
const { getMe, updateMe, changePassword } = require('../../controller/user.controller');
const { protect } = require('../../middlewares/auth.middleware');

// All user routes require authentication
router.use(protect);

router.get('/me',                  getMe);
router.patch('/me',                updateMe);
router.post('/me/change-password', changePassword);

module.exports = router;