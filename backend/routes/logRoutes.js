const express = require('express');
const { createLog, getLogs, deleteLog } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply 'protect' middleware to secure these routes
router.route('/')
  .post(protect, createLog)
  .get(protect, getLogs);

router.route('/:id')
  .delete(protect, deleteLog);

module.exports = router;