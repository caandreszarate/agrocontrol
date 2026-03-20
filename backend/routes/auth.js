const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', protect, register);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);

module.exports = router;
