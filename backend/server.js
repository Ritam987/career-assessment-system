const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db'); // Importing the database connection
const authRoutes = require('./routes/authRoutes'); // Importing the authentication routes

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware configuration
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Parses incoming JSON requests

// Basic Test Route
app.get('/', (req, res) => {
    res.send('🚀 Career Assessment System API is running...');
});

// ==========================================
// Authentication API Routes
// All requests starting with /api/auth will be handled by authRoutes
// ==========================================
app.use('/api/auth', authRoutes);

// Start the server on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});