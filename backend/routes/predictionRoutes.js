const express = require('express');
const { getPrediction } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect the route with authentication
router.post('/', protect, getPrediction);

module.exports = router;