const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // 🔹 INJECTED: কুকি হ্যান্ডেল করার জন্য
const dotenv = require('dotenv');
const db = require('./config/db'); // Importing the database connection
const authRoutes = require('./routes/authRoutes'); // Importing the authentication routes
const requestIdMiddleware = require('./middlewares/requestId'); // Importing the request ID middleware

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware configuration
// 🔹 INJECTED: CORS updated to receive cookies from the frontend
app.use(cors({
    origin: 'http://localhost:5173', // Your React frontend's port (Vite's default port)
    credentials: true 
})); 
app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // 🔹 INJECTED: কুকি পার্স করার মিডলওয়্যার

// Register the Request ID middleware at the top to track every incoming request
app.use(requestIdMiddleware);

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
    console.log(`Server is running on port : http://localhost:${PORT}`);
});