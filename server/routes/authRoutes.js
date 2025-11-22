const express = require('express');
const { login, signup, me, refresh, resetOtp, resetPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/refresh', refresh);
router.post('/reset-otp', resetOtp);
router.post('/reset', resetPassword);
router.get('/me', authenticateToken, me);
router.post('/logout', (req, res) => res.sendStatus(200)); // Client-side logout mostly

module.exports = router;
