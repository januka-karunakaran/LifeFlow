const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();

// Middlewares
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/predictions', predictionRoutes);

module.exports = app;