const axios = require('axios');

// @desc    Get ML prediction for daily routine (What-if Simulator)
// @route   POST /api/predictions
// @access  Private
const getPrediction = async (req, res) => {
  try {
    // Python FastAPI URL (Port 8000)
    const mlServiceUrl = 'http://127.0.0.1:8000/predict';
    
    // Send the request to the Python FastAPI
    const response = await axios.post(mlServiceUrl, req.body);
    
   
    res.json(response.data);
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ message: 'Error fetching prediction from ML service' });
  }
};

module.exports = { getPrediction };
