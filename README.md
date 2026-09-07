# Career Assessment System

A modern, full-stack Web Application designed for comprehensive career guidance, psychometric/skill assessment, domain analysis, personalized recommendations, and admin management. Built with **Node.js, Express, MySQL, React, and Vite**.

---

## 🌟 Key Features & Capabilities

### 👤 User Interface & Experience
- **Multilingual Support (i18n)**: Instant switching between **English (EN)**, **Bengali (BN)**, and **Hindi (HI)** across all user and admin flows.
- **Dynamic Dark / Light Theme**: Seamless global dark and light mode with HSL-tailored palettes and glassmorphism styling.
- **Mobile & Tablet Responsive Design**: Optimized layouts for mobile, tablet, and desktop viewports with a dedicated **Mobile Bottom Navigation Bar** for smartphones.

### 🎯 User & Assessment Features
- **User Authentication**: Secure registration and login with email case-normalization, input validation, and JWT token authentication.
- **Redesigned User Dashboard**: Personal greeting, hero purple banner, 4 live stat cards, "Continue Your Journey" status card, and popular career categories.
- **Interactive Assessment Engine**:
  - Timed question workflow with progress indicator.
  - Question review sidebar (Answered, Unanswered, Marked for Review).
  - Autosave state per question.
  - Spaced action controls (`Previous`, `Mark for Review`, `Next`).
- **Comprehensive Assessment Report**: Detailed career recommendations, domain scores, skill breakdown, and PDF download options.
- **User Profile Management**: Redesigned profile form with avatar badge, personal details, location info, and education/career goals.
- **Help & Support & Notifications**: Dedicated real-time notifications view and interactive support request forms.

### 🛡️ Admin Management Panel
- **Admin Authentication**: Role-restricted admin login (`/api/admin/login`).
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
+-----------------------------------+-----------------------------------+
                                    |
                                    | REST API (JWT & Axios)
                                    v
+-----------------------------------------------------------------------+
|                           Backend (Node.js + Express)                  |
|  authRoutes | assessmentRoutes | adminRoutes | userRoutes             |
|  notificationRoutes | supportRoutes | initDb (Auto Schema)            |
+-----------------------------------+-----------------------------------+
                                    |
                                    | mysql2 connection pool
                                    v
+-----------------------------------------------------------------------+
|                            Database (MySQL)                           |
|  users | admins | questions | assessments | user_responses            |
|  careers | categories | assessment_results | notifications            |
|  support_requests | system_settings                                   |
+-----------------------------------------------------------------------+
```

---

## 📁 Repository Structure

```text
career-assessment-system/
├── README.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── server.js                     # Express server & API routes entry point
│   ├── config/
│   │   ├── db.js                     # MySQL connection pool
│   │   └── initDb.js                 # Automatic DB schema & table creation
│   ├── controllers/
│   │   ├── adminController.js        # Admin management logic
│   │   ├── assessmentController.js   # Assessment scoring & lifecycle logic
│   │   ├── authController.js         # User registration & JWT authentication
│   │   └── questionController.js     # Question bank management
│   ├── middlewares/
│   │   ├── authMiddleware.js         # JWT token verification
│   │   ├── requestId.js              # Request tracking middleware
│   │   └── roleMiddleware.js         # Admin role guard
│   ├── models/
│   │   └── userModel.js              # User DB access layer
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── assessmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   └── userRoutes.js
│   └── utils/
│       ├── pdfGenerator.js           # Server-side PDF report generator
│       └── scoreCalculator.js        # Assessment scoring algorithm
└── frontend/
    ├── package.json
    ├── vite.config.js                # Vite build configuration
    ├── index.html
    └── src/
        ├── App.jsx                   # Route provider & Theme/Lang wrappers
        ├── main.jsx
        ├── components/
        │   ├── Footer.jsx
        │   ├── Loader.jsx
        │   ├── MobileBottomNav.jsx    # Mobile responsive bottom navbar
        │   └── navbar/
        │       ├── Navbar.jsx        # Sticky top navigation header
        │       └── navbar.css
        ├── context/
        │   ├── AuthContext.jsx       # Auth state provider
        │   ├── LanguageContext.jsx   # Multilingual i18n provider
        │   └── ThemeContext.jsx      # Light/Dark theme provider
        ├── pages/
        │   ├── Homepage/             # Main home & hero card
        │   ├── Userpage/             # User dashboard, profile, notifications, support
        │   ├── Testpage/             # Timed assessment test interface
        │   ├── Resultpage/           # Assessment report & recommendations
        │   ├── Adminpage/            # Admin dashboard, user management, settings
        │   ├── Loginpage/            # User & admin login pages
        │   └── Registrationpage/     # Registration page
        └── services/                 # API service layer (auth, assessments, etc.)
```

---

## 🛠️ API Reference Summary

Default Server URL: `http://localhost:5000`

### 🟢 Public & Health Endpoints
- `GET /` - Health check & server status

### 🔐 Auth Endpoints (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (Returns JWT & User payload)
- `GET /api/auth/profile` - Fetch current user profile
- `PUT /api/auth/profile` - Update user profile details

### 📝 Assessment Endpoints (`/api/assessments`)
- `POST /api/assessments/start` - Start new assessment session
- `GET /api/assessments/next-question` - Fetch next/current question
- `POST /api/assessments/submit-answer` - Submit/Autosave question answer
- `POST /api/assessments/complete` - Finalize assessment & calculate domain scores
- `GET /api/assessments/history` - Fetch user assessment history
- `GET /api/assessments/result/latest` - Fetch latest assessment report

### 🛡️ Admin Endpoints (`/api/admin`)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/users` - Fetch list of registered users
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/questions` - Fetch question bank
- `POST /api/admin/questions` - Create new assessment question
- `GET /api/admin/careers` - Fetch career role mappings
- `POST /api/admin/careers` - Add new career role
- `GET /api/admin/assessment-results` - Oversight of all user assessment completions
- `GET /api/admin/settings` - Fetch system settings
- `PUT /api/admin/settings` - Update system settings

---

## 🚀 Local Setup & Running Guide

### 1. Database Setup
Make sure MySQL server is running locally and set up your credentials in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=career_assessment
JWT_SECRET=your_jwt_secret_key
```
> **Note**: The backend automatically initializes and creates required database tables on startup via `initDb.js`.

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
