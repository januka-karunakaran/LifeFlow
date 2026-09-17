const DailyLog = require('../models/DailyLog');

// @desc    Create a new daily log
// @route   POST /api/logs
// @access  Private
const createLog = async (req, res) => {
  try {
    const { 
      date, sleepHours, workHours, screenTime, tasksPlanned, tasksCompleted, 
      exerciseMinutes, breakMinutes, meetings, socialMediaMinutes, moodScore, 
      previousProductivity, productivityScore 
    } = req.body;

    // Check if a log already exists for this date for the current user
    const logExists = await DailyLog.findOne({ userId: req.user._id, date });
    
    if (logExists) {
      return res.status(400).json({ message: 'Log for this date already exists' });
    }

    const log = await DailyLog.create({
      userId: req.user._id,
      date,
      sleepHours,
      workHours,
      screenTime,
      tasksPlanned,
      tasksCompleted,
      exerciseMinutes,
      breakMinutes,
      meetings,
      socialMediaMinutes,
      moodScore,
      previousProductivity,
      productivityScore
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all daily logs for the logged-in user
// @route   GET /api/logs
// @access  Private
const getLogs = async (req, res) => {
  try {
    // Fetch logs only for the logged-in user, sorted by date (newest first)
    const logs = await DailyLog.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLog, getLogs };