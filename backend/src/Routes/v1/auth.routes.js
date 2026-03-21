const router = require('express').Router();
const { register, login, refreshToken } = require('../../controller/auth.controller');

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refreshToken);

module.exports = router;