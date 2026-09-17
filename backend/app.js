const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet()); // Security-க்காக[cite: 1]
app.use(cors()); // Frontend-backend communication-க்காக[cite: 1]
app.use(express.json()); // JSON data-வை படிக்க

// Basic Test Route
app.get('/', (req, res) => {
    res.send('LifeFlow API is running...');
});

module.exports = app;