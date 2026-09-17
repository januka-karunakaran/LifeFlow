const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 

// Basic Test Route
app.get('/', (req, res) => {
    res.send('LifeFlow API is running...');
});

module.exports = app;