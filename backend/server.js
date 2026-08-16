const express = require('express'); // Importing the Express framework and more
const cors = require('cors'); // To handle Cross-Origin Resource Sharing
const cookieParser = require('cookie-parser'); // To handle cookies
const dotenv = require('dotenv'); // To load environment variables from .env file
const db = require('./config/db'); // Importing the database connection
const authRoutes = require('./routes/authRoutes'); // Importing the authentication routes
const requestIdMiddleware = require('./middlewares/requestId'); // Importing the request ID middleware
const assessmentRoutes = require('./routes/assessmentRoutes'); // Importing the assessment routes
const adminRoutes = require('./routes/adminRoutes'); // Importing the admin routes

// Load environment variables from .env file
dotenv.config();

const app = express(); // Create an Express application instance

// Middleware configuration
// CORS updated to receive cookies from the frontend
app.use(cors({
    origin: 'http://localhost:5173', // Your React frontend's port (Vite's default port)
    credentials: true 
})); 
app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Middleware to parse cookies

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
app.use('/api/auth', authRoutes); // Registering the authentication routes
app.use('/api/assessments', assessmentRoutes); // Registering the assessment routes
app.use('/api/admin', adminRoutes); // Registering the admin routes

// Start the server on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port : http://localhost:${PORT}`);
});