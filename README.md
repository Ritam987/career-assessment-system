# Career Assessment System

A modern, full-stack Web Application designed for comprehensive career guidance, psychometric/skill assessment, domain analysis, personalized recommendations, and admin management. Built with **Node.js, Express, MySQL, React, and Vite**.

---

## 🌟 Key Features & Capabilities

### 👤 User Interface & Experience
- **Multilingual Support (i18n)**: Instant switching between **English (EN)**, **Bengali (BN)**, and **Hindi (HI)** across all user and admin flows.
- **Dynamic Dark / Light Theme**: Seamless global dark and light mode with HSL-tailored palettes and glassmorphism styling.
- **Mobile & Tablet Responsive Design**: Optimized layouts for mobile, tablet, and desktop viewports with a dedicated **Mobile Bottom Navigation Bar** for smartphones.

### ✉️ Email OTP Verification & Security
- **6-Digit Email OTP Verification**: Automated 6-digit OTP code generation and 10-minute expiration tracking stored in MySQL (`otps` table).
- **Live SMTP Nodemailer Integration**: Configured for live email delivery via Gmail SMTP (`SMTP_USER`, `SMTP_PASS`) with automatic local console fallback for offline dev mode.
- **Self-Service Password Reset**: Secure OTP-based password reset workflow allowing users to recover accounts directly via email.
- **Smart Unverified Account Management**: Re-submitting registration updates user details and dispatches a fresh OTP without blocking re-registration. Unverified logins automatically prompt the interactive `OtpModal`.

### 🎯 User & Assessment Features
- **User Authentication**: Secure registration and credential-based login with email case-normalization, input validation, and HTTP-Only JWT token cookies.
- **Redesigned User Dashboard**: Personal greeting, hero purple banner, 4 live stat cards, "Continue Your Journey" status card, and popular career categories.
- **Interactive Assessment Engine**:
  - Timed question workflow with progress indicator.
  - Question review sidebar (Answered, Unanswered, Marked for Review).
  - Autosave state per question.
  - Spaced action controls (`Previous`, `Mark for Review`, `Next`).
- **Comprehensive Assessment Report**: Detailed career recommendations, domain scores, skill breakdown, and PDF download options.
- **User Profile Management**: Redesigned profile form with avatar badge, personal details, location info, and education/career goals.
- **Help & Support & Notifications**: Dedicated real-time notifications view and interactive support request forms.

### 🛡️ Admin Management Panel & CLI Tools
- **Admin Authentication**: Role-restricted admin login (`/api/admin/login`).
- **Interactive Admin CLI Tool**: Dedicated command-line script (`npm run add-admin`) to interactively or via 1-line commands create real `SuperAdmin` / `Admin` accounts with salted bcrypt hashing.
- **Question & Domain Management**: Add, view, edit questions, assign categories, and export question lists to CSV.
- **Career Roles Management**: Add new career roles with skill domain mapping and qualification requirements.
- **User Management**: View registered user accounts and manage/delete user records.
- **Assessment Results Oversight**: View all user test completion records and scores.
- **System Settings Configuration**: Manage system-wide configuration settings.

---

## 🏗️ Project Architecture

```text
+-----------------------------------------------------------------------+
|                           Frontend (React + Vite)                      |
|  Home | Dashboard | Assessment Intro | Test Page | Report Page        |
|  Profile | Notifications | Support | Settings | Admin Panel            |
|  OtpModal (Email Verification & Password Reset)                        |
+-----------------------------------+-----------------------------------+
                                    |
                                    | REST API (JWT & Axios)
                                    v
+-----------------------------------------------------------------------+
|                           Backend (Node.js + Express)                  |
|  authRoutes | otpController | mailer (SMTP) | assessmentRoutes        |
|  adminRoutes | userRoutes | notificationRoutes | initDb (Auto Schema) |
+-----------------------------------+-----------------------------------+
                                    |
                                    | mysql2 connection pool
                                    v
+-----------------------------------------------------------------------+
|                            Database (MySQL)                           |
|  users (is_verified) | otps | admins | questions | assessments        |
|  user_responses | careers | categories | assessment_results           |
|  notifications | support_requests | system_settings                   |
+-----------------------------------------------------------------------+
```

---

## 📁 Repository Structure

```text
career-assessment-system/
├── README.md
├── backend/
│   ├── .env                           # Server port, DB & SMTP configuration
│   ├── package.json
│   ├── server.js                      # Express server & API routes entry point
│   ├── config/
│   │   ├── db.js                      # MySQL connection pool
│   │   └── initDb.js                  # Automatic DB schema & table creation
│   ├── controllers/
│   │   ├── adminController.js         # Admin management logic
│   │   ├── assessmentController.js    # Assessment scoring & lifecycle logic
│   │   ├── authController.js          # User registration & JWT authentication
│   │   ├── otpController.js           # Email OTP dispatch, verification & password reset
│   │   ├── questionController.js      # Question bank management
│   │   └── userController.js          # Profile & user stats management
│   ├── middlewares/
│   │   ├── adminMiddleware.js         # Admin role guard
│   │   ├── authMiddleware.js          # JWT token verification
│   │   └── requestId.js               # Request tracking middleware
│   ├── models/
│   │   └── userModel.js               # User DB access layer
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── assessmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   ├── addAdmin.js                # CLI tool to create admin accounts
│   │   └── seedData.js                # Initial database seeder
│   └── utils/
│       ├── errorHandler.js            # Standardized server error helper
│       ├── mailer.js                  # Nodemailer SMTP email service
│       ├── pdfGenerator.js            # Server-side PDF report generator
│       └── scoreCalculator.js         # Assessment scoring algorithm
└── frontend/
    ├── package.json
    ├── vite.config.js                 # Vite build & proxy configuration
    ├── index.html
    └── src/
        ├── App.jsx                    # Route provider & Theme/Lang wrappers
        ├── main.jsx
        ├── components/
        │   ├── Footer.jsx
        │   ├── Loader.jsx
        │   ├── MobileBottomNav.jsx     # Mobile responsive bottom navbar
        │   ├── common/
        │   │   ├── OtpModal.jsx       # Email OTP verification & reset modal
        │   │   └── OtpModal.css
        │   └── navbar/
        │       ├── Navbar.jsx         # Sticky top navigation header
        │       └── navbar.css
        ├── context/
        │   ├── AuthContext.jsx        # Auth state provider
        │   ├── LanguageContext.jsx    # Multilingual i18n provider
        │   └── ThemeContext.jsx       # Light/Dark theme provider
        ├── pages/
        │   ├── Homepage/              # Main home & hero card
        │   ├── Userpage/              # User dashboard, profile, notifications, support
        │   ├── Testpage/              # Timed assessment test interface
        │   ├── Resultpage/            # Assessment report & recommendations
        │   ├── Adminpage/             # Admin dashboard, user management, settings
        │   ├── Loginpage/             # User & admin login pages
        │   └── Registrationpage/      # Registration page
        ├── services/                  # API service layer (auth, assessments, etc.)
        └── config/                    # API & Axios central configuration
```

---

## 🛠️ API Reference Summary

Default Server URL: `http://localhost:5000`

### 🟢 Public & Health Endpoints
- `GET /` - Health check & server status

### 🔐 Auth & OTP Endpoints (`/api/auth`)
- `POST /api/auth/register` - User registration (Saves user & dispatches OTP)
- `POST /api/auth/login` - User login (Validates credentials & `is_verified`)
- `POST /api/auth/send-otp` - Dispatch 6-digit OTP code to email
- `POST /api/auth/verify-otp` - Verify OTP code & activate account (`is_verified = TRUE`)
- `POST /api/auth/reset-password-otp` - Verify OTP code & set new user password
- `GET /api/auth/profile` - Fetch current user profile
- `PUT /api/auth/profile` - Update user profile details
- `POST /api/auth/logout` - Clear session token cookies

### 📝 Assessment Endpoints (`/api/assessments`)
- `POST /api/assessments/start` - Start new assessment session
- `GET /api/assessments/next-question` - Fetch next/current question
- `POST /api/assessments/submit-answer` - Submit/Autosave question answer
- `POST /api/assessments/complete` - Finalize assessment & calculate domain scores
- `GET /api/assessments/history` - Fetch user assessment history
- `GET /api/assessments/result/latest` - Fetch latest assessment report

### 🛡️ Admin Endpoints (`/api/admin`)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/analytics` - Fetch dashboard summary statistics
- `GET /api/admin/users` - Fetch list of registered users
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/questions` - Fetch question bank
- `POST /api/admin/questions` - Create new assessment question
- `PUT /api/admin/questions/:id` - Update question details
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/careers` - Fetch career role mappings
- `POST /api/admin/careers` - Add new career role
- `GET /api/admin/assessment-results` - Oversight of all user assessment completions
- `GET /api/admin/settings` - Fetch system settings
- `PUT /api/admin/settings` - Update system settings

---

## 🛠️ Admin Management Utility (`addAdmin.js`)

Add new `SuperAdmin` or `Admin` accounts manually at any time using the dedicated CLI tool:

### 1. Interactive Prompt Mode:
```bash
cd backend
npm run add-admin
```
Follow the on-screen prompts to enter the admin name, email, password, and role.

### 2. Quick One-Line Command:
```bash
cd backend
npm run add-admin "Admin Name" "admin@example.com" "Password123" "SuperAdmin"
```

---

## 🚀 Local Setup & Running Guide

### 1. Database & SMTP Setup
Make sure MySQL server is running locally and set up your credentials in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=career_assessment_db
JWT_SECRET=your_jwt_secret_key

# Nodemailer Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="REACH Support Services" <your_email@gmail.com>
```
> **Note**: The backend automatically initializes missing database tables (`users`, `otps`, `admins`, `system_settings`, etc.) and seeds default data on startup via `initDb.js`.

### 2. Start Backend Server
```bash
cd backend
npm install
node server.js
```

### 3. Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Build & Verification Commands

- **Frontend Bundle Build**:
  ```bash
  cd frontend && npm run build
  ```
- **Backend Syntax Verification**:
  ```bash
  cd backend && node --check server.js
  ```
