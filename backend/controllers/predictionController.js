const axios = require('axios');

// @desc    Get ML prediction for daily routine (What-if Simulator)
// @route   POST /api/predictions
// @access  Private
const getPrediction = async (req, res) => {
  try {
    // Python FastAPI URL (Port 8000 locally, or deployed URL)
    const mlBaseUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    const mlServiceUrl = `${mlBaseUrl.replace(/\/$/, '')}/predict`;

    const payload = {
      sleep_hours: req.body.sleep_hours ?? req.body.sleepHours ?? 7,
      work_hours: req.body.work_hours ?? req.body.workHours ?? 8,
      screen_time: req.body.screen_time ?? req.body.screenTime ?? 4,
      exercise_minutes: req.body.exercise_minutes ?? req.body.exerciseMinutes ?? 30,
      mood_score: req.body.mood_score ?? req.body.moodScore ?? 8,
      break_minutes: req.body.break_minutes ?? req.body.breakMinutes ?? 60,
      meetings: req.body.meetings ?? 2,
      social_media_minutes: req.body.social_media_minutes ?? req.body.socialMediaMinutes ?? 45,
      previous_productivity: req.body.previous_productivity ?? req.body.previousProductivity ?? 75,
    };
    
    // Send the request to the Python FastAPI
    const response = await axios.post(mlServiceUrl, payload);
    
    res.json(response.data);
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ message: 'Error fetching prediction from ML service' });
  }
};

module.exports = { getPrediction };
