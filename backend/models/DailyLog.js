const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Links this log to a specific user
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  sleepHours: {
    type: Number,
    required: true,
    default: 0,
  },
  workHours: {
    type: Number,
    required: true,
    default: 0,
  },
  screenTime: {
    type: Number,
    required: true,
    default: 0,
  },
  tasksPlanned: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  exerciseMinutes: {
    type: Number,
    default: 0,
  },
  breakMinutes: {
    type: Number,
    default: 0,
  },
  meetings: {
    type: Number,
    default: 0,
  },
  socialMediaMinutes: {
    type: Number,
    default: 0,
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  previousProductivity: {
    type: Number,
    default: 0, // Yesterday's productivity score
  },
  productivityScore: {
    type: Number,
    default: 0, // Calculated or self-rated productivity for today
  }
}, { timestamps: true });

// Prevent a user from creating multiple logs for the same day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);
module.exports = DailyLog;