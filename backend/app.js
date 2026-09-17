const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const app = express();

// Middleware
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 

// Basic Test Route
app.get('/', (req, res) => {
    res.send('LifeFlow API is running...');
});
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
module.exports = app;