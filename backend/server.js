const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');
require('dotenv').config();

const db               = require('./config/db');
const authRoutes       = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const adminRoutes      = require('./routes/adminRoutes');
const requestId        = require('./middlewares/requestId');

const app = express();

// Uploads dir
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// CORS
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5500'],
    credentials: true
}));

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestId);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'html-frontend')));

// API routes
app.use('/api/auth',        authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/admin',       adminRoutes);

// Health check
app.get('/api', (req, res) => {
    res.json({ message: 'Career Assessment System API is running', version: '2.0' });
});

// Catch-all for SPA
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'html-frontend', 'index.html'));
    } else {
        next();
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n Server running at: http://localhost:' + PORT);
    console.log(' Frontend:          http://localhost:' + PORT + '/index.html');
    console.log(' API base:          http://localhost:' + PORT + '/api\n');
});
