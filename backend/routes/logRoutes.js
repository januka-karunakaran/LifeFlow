const express = require('express');
const { createLog, getLogs, deleteLog, getLeaderboard } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply 'protect' middleware to secure these routes
router.route('/')
  .post(protect, createLog)
  .get(protect, getLogs);

// Leaderboard route - must be declared before /:id
router.route('/leaderboard')
  .get(protect, getLeaderboard);

router.route('/:id')
  .delete(protect, deleteLog);

module.exports = router;