const express = require('express');
const { createLog, getLogs } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply 'protect' middleware to secure these routes
router.route('/')
  .post(protect, createLog)
  .get(protect, getLogs);

module.exports = router;