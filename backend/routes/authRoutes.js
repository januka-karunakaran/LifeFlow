const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Middleware Import

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/me', protect, getMe);

module.exports = router;