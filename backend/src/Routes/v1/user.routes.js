const router     = require('express').Router();
const controller = require('../../controller/user.controller');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');

// All user routes require authentication
router.use(protect);

router.get('/me',              controller.getMe);
router.patch('/me',            controller.updateMe);
router.post('/me/change-password', controller.changePassword);

module.exports = router;