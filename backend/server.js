require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000; //[cite: 1]

app.listen(PORT, () => {
    console.log(`Server is running in development mode on port ${PORT}`);
});