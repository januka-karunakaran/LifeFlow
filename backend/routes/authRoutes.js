const express = require('express');
const {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);

module.exports = router;