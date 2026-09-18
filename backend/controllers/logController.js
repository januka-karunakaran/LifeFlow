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

    const logDate = date || req.body.date || new Date().toISOString().split('T')[0];

    // Check if a log already exists for this date for the current user
    const logExists = await DailyLog.findOne({ userId: req.user._id, date: logDate });
    
    if (logExists) {
      return res.status(400).json({ message: 'Log for this date already exists' });
    }

    const log = await DailyLog.create({
      userId: req.user._id,
      date: logDate,
      sleepHours: sleepHours ?? req.body.sleep_hours ?? 0,
      workHours: workHours ?? req.body.work_hours ?? 0,
      screenTime: screenTime ?? req.body.screen_time ?? 0,
      tasksPlanned: tasksPlanned ?? req.body.tasks_planned ?? 0,
      tasksCompleted: tasksCompleted ?? req.body.tasks_completed ?? 0,
      exerciseMinutes: exerciseMinutes ?? req.body.exercise_minutes ?? 0,
      breakMinutes: breakMinutes ?? req.body.break_minutes ?? 0,
      meetings: meetings ?? req.body.meetings ?? 0,
      socialMediaMinutes: socialMediaMinutes ?? req.body.social_media_minutes ?? 0,
      moodScore: moodScore ?? req.body.mood_score ?? 5,
      previousProductivity: previousProductivity ?? req.body.previous_productivity ?? 0,
      productivityScore: productivityScore ?? req.body.productivity_score ?? 0
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

// @desc    Delete a daily log
// @route   DELETE /api/logs/:id
// @access  Private
const deleteLog = async (req, res) => {
  try {
    const log = await DailyLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    await DailyLog.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Log removed successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLog, getLogs, deleteLog };