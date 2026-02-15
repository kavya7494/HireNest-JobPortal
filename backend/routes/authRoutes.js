const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { registerRules, loginRules, updateProfileRules } = require('../middlewares/validate');
const { uploadResume, uploadAvatar } = require('../middlewares/upload');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again in 5 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerRules, authController.register);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/resend-otp', otpLimiter, authController.resendOtp);
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, updateProfileRules, authController.updateProfile);
router.put('/resume', authenticate, uploadResume, authController.uploadResume);
router.put('/avatar', authenticate, uploadAvatar, authController.uploadAvatar);

module.exports = router;
