/**
 * ============================================================================
 * SERVER.JS - Express Backend Entry Point
 * ============================================================================
 * Purpose: This file initializes the Express application, configures security
 * and parsing middleware (CORS, JSON, Cookies, Request Tracing), initializes
 * the MySQL database schema automatically, registers API router endpoints,
 * and starts listening for HTTP client connections on the configured PORT.
 * ============================================================================
 */

// 1. Core Node.js & Third-Party Package Imports
const express = require('express');          // Core Web Application Framework for Node.js
const cors = require('cors');                // Middleware to enable Cross-Origin Resource Sharing
const cookieParser = require('cookie-parser'); // Middleware to parse incoming HTTP cookie headers
const dotenv = require('dotenv');            // Utility to load environment variables from a .env file
const path = require('path');                // Core Node.js path module for cross-platform file paths
const os = require('os');

// 2. Load Environment Variables from .env file located in backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 3. Database Connection & System Service Imports
const db = require('./config/db');           // MySQL Database Connection Pool instance
const initDb = require('./config/initDb');   // Database auto-schema migration & table initializer script

// 4. API Route Handlers Imports
const authRoutes = require('./routes/authRoutes');                 // Authentication routes (Register, Login, Logout)
const userRoutes = require('./routes/userRoutes');                 // User profile management routes (Profile CRUD, Stats)
const assessmentRoutes = require('./routes/assessmentRoutes');     // Assessment lifecycle routes (Start, Answer, Complete, Report)
const adminRoutes = require('./routes/adminRoutes');               // Admin panel routes (Users, Careers, Questions, Settings)
const questionRoutes = require('./routes/questionRoutes');         // Question bank management routes
const notificationRoutes = require('./routes/notificationRoutes'); // User notification feed routes
const supportRoutes = require('./routes/supportRoutes');           // Customer support & help request routes

// 5. Instantiate Express Application Instance
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// A. Dynamic CORS (Cross-Origin Resource Sharing) Configuration
// Explicitly allows Netlify deployment (https://career-assessment-system-reach-india.netlify.app),
// localhost, and mobile device origins with credentials & preflight support.
const allowedOrigins = [
    'https://career-assessment-system-reach-india.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Return origin if matched or allowed
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.netlify.app') || process.env.NODE_ENV !== 'production') {
            return callback(null, origin);
        }
        
        return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
}));

// B. Request Body & Cookie Parsing Middlewares
app.use(express.json());       // Parse incoming requests with JSON payloads into req.body
app.use(cookieParser());       // Parse cookies attached to the client request into req.cookies

// C. Custom Request Tracking Middleware
// Attaches a unique request ID (X-Request-ID) to incoming requests for audit logging & debugging
const requestIdMiddleware = require('./middlewares/requestId');
app.use(requestIdMiddleware);

// ============================================================================
// DATABASE AUTOMATIC INITIALIZATION
// ============================================================================
// Automatically checks for missing database tables (users, assessments, careers, settings)
// and creates them on startup so the system is self-contained and ready to run immediately.
initDb();

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================
// Endpoint: GET /
// Description: Simple health check endpoint to confirm the Express backend API is alive.
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Career Assessment System API is running smoothly...',
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// MOUNT API ROUTE ENDPOINTS
// ============================================================================
app.use('/api/auth', authRoutes);                   // User authentication routes (Register, Login, Logout)
app.use('/api/user', userRoutes);                   // User profile management routes (Profile, Stats, Account)
app.use('/api/assessments', assessmentRoutes);     // Assessment test taking, autosaving, scoring & reports
app.use('/api/admin', adminRoutes);                 // Admin management panel endpoints
app.use('/api/questions', questionRoutes);         // Question bank endpoints
app.use('/api/notifications', notificationRoutes); // User notification endpoints
app.use('/api/support', supportRoutes);             // Support request endpoints

// Static Assets Serving (Serves generated PDF reports from the 'reports/' directory)
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// ============================================================================
// START EXPRESS HTTP SERVER
// ============================================================================
const PORT = process.env.PORT || 5000; // Read server port from environment variable or default to 5000
const HOST = process.env.HOST || '0.0.0.0';

function lanIPv4Addresses() {
    const nets = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            const family = net.family === 'IPv4' || net.family === 4;
            if (family && !net.internal) ips.push(net.address);
        }
    }
    return ips;
}

app.listen(PORT, HOST, () => {
    const lanIps = lanIPv4Addresses();
    console.log(`===========================================================`);
    console.log(`🚀 Career Assessment Backend Server running on ${HOST}:${PORT}`);
    console.log(`🔗 Laptop:     http://localhost:${PORT}`);
    lanIps.forEach((ip) => {
        console.log(`📱 Phone: open http://${ip}:5173  (Vite proxies /api to this backend)`);
    });
    console.log(`===========================================================`);
});