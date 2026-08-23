# Career Assessment System

## Project Overview

The Career Assessment System is a full-stack application designed to support career guidance, user profiling, skill-domain analysis, and assessment-driven recommendations. The backend is built with Node.js and Express.js, and the frontend is built with React + Vite. The project follows a modular structure with separate folders for backend logic, frontend pages, route definitions, database access, and shared UI components.

This repository currently includes:

- A backend API service in `backend/` with secure registration, login, admin flows, and assessment APIs.
- A MySQL connection configured in `backend/config/db.js` using environment-based values.
- Request tracking middleware for debugging and traceability.
- A React + Vite frontend in `frontend/` with multiple routes and page modules for user and admin flows.

Note: The current active implementation in this workspace is aligned to a MySQL-backed backend using `mysql2`, and the frontend is connected to the local backend through `http://localhost:5000`.

## Updated Project Status

The project has moved beyond the initial backend-only setup. The following sections reflect the current implementation as it appears in the repository today.

### Completed and active implementation

- Express server configured with JSON parsing, CORS, cookie support, and request ID tracking.
- Database connectivity through MySQL pool with environment-based configuration.
- User registration flow with validation, duplicate email prevention, and password hashing.
- User login flow returning a JWT token and basic user details.
- Admin setup and admin login flow with JWT-based authentication.
- Assessment lifecycle APIs for starting, resuming, submitting answers, completing, and viewing history.
- Admin APIs for questions, careers, users, analytics, and category listing.
- React routing for home, login, registration, about-assessment, user dashboard, test page, report page, and admin login/dashboard.
- Frontend UI scaffolding for the main screens and navigation flow.

### Current status summary

- Backend: Implemented and actively structured for authentication, admin management, and assessment logic.
- Frontend: UI pages and routing are in place; the interface is functional as a scaffold and is ready for further refinement.
- Testing and final polish: still ongoing for a complete end-to-end assessment flow, analytics dashboard, and result generation.

## Project Structure

```text
career-assessment-system/
├── README.md
├── backend/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── assessmentController.js
│   │   ├── authController.js
│   │   └── questionController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── requestId.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   └── userModel.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── assessmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   └── userRoutes.js
│   └── utils/
│       ├── pdfGenerator.js
│       └── scoreCalculator.js
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── assets/
│       │   └── logo.png
│       ├── components/
│       │   ├── Footer.jsx
│       │   ├── Loader.jsx
│       │   ├── button/
│       │   │   └── Button.jsx
│       │   ├── dialoguebox/
│       │   │   └── ConfirmationDialog.jsx
│       │   └── navbar/
│       │       ├── Navbar.jsx
│       │       └── navbar.css
│       ├── pages/
│       │   ├── Homepage/
│       │   │   └── MainHome.jsx
│       │   ├── Loginpage/
│       │   │   ├── Login.jsx
│       │   │   ├── Adminlogin.jsx
│       │   │   ├── login.css
│       │   │   └── adminlogin.css
│       │   ├── Registrationpage/
│       │   │   ├── Registaration.jsx
│       │   │   └── Registration.css
│       │   ├── Userpage/
│       │   │   └── Userdashboard.jsx
│       │   ├── Testpage/
│       │   │   └── Testpage.jsx
│       │   ├── Resultpage/
│       │   │   └── Report_page_after_test.jsx
│       │   ├── Adminpage/
│       │   │   └── Admindashboard.jsx
│       │   ├── aboutassesment/
│       │   │   └── Aboutassesment.jsx
│       │   └── errorPage/
│       │       └── Errormessage.jsx
│       └── services/
│           ├── auth.js
│           ├── fetchQuestion.js
│           ├── getUserProfile.js
│           ├── multilanguage.js
│           └── postCredentials.js
└── .git/
```

### Directory responsibilities

- `backend/config/`: Database and environment configuration.
- `backend/controllers/`: Authentication, assessment, admin, and user business logic.
- `backend/models/`: Database interaction for user-related data.
- `backend/routes/`: Express routing for all API groups.
- `backend/middlewares/`: Authentication, admin rules, and request-tracking logic.
- `backend/utils/`: Result and document-related helper modules.
- `frontend/src/pages/`: Feature screen modules for home, login, registration, dashboard, assessment, report, and admin tools.
- `frontend/src/components/`: Shared UI elements such as navbar, buttons, loader, and confirmation dialog.
- `frontend/src/services/`: API fetching logic for user/auth and assessment data.

## Updated Architecture Overview

```text
+------------------------------------------------------------+
|                         Frontend (React)                    |
|  Home | About Assessment | Login | Registration | Dashboard |
|  Test | Report | Admin Login | Admin Dashboard             |
+-------------------------+----------------------------------+
                          |
                          | REST API
                          v
+------------------------------------------------------------+
|                         Backend (Express)                    |
|  authRoutes | assessmentRoutes | adminRoutes               |
|  authController | assessmentController | adminController    |
+-------------------------+----------------------------------+
                          |
                          | MySQL database
                          v
+------------------------------------------------------------+
|                        Database (MySQL)                     |
|  users | admins | questions | assessments | careers      |
|  categories | user_responses                               |
+------------------------------------------------------------+
```

## API documentation

The current backend listens on `http://localhost:5000` unless overridden in the backend `.env` file.

### Health check

- `GET /`
- Returns a running-status message from the server.

Example response:

```json
{
  "message": "Career Assessment System API is running..."
}
```

### Authentication endpoints

#### 1) Register a new user

- `POST /api/auth/register`
- Controller: `backend/controllers/authController.js`
- Model: `backend/models/userModel.js`

Sample request body:

```json
{
  "name": "Ritam Das",
  "gender": "male",
  "email": "ritam@example.com",
  "password": "StrongPassword123",
  "phone": "9876543210",
  "dob": "1998-05-12",
  "age": 26,
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700001",
  "education_level": "bachelors",
  "preferred_field": "Software Development",
  "career_goal": "Become a senior full-stack engineer"
}
```

Expected behavior:

- Checks for an existing email.
- Hashes the password with bcrypt.
- Stores user details in the `users` table.
- Returns a success message on completion.

Sample response:

```json
{
  "message": "User registered successfully!"
}
```

#### 2) Login a user

- `POST /api/auth/login`
- Controller: `backend/controllers/authController.js`

Sample request:

```json
{
  "email": "ritam@example.com",
  "password": "StrongPassword123"
}
```

Sample response:

```json
{
  "message": "Login successful!",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Ritam Das",
    "email": "ritam@example.com"
  }
}
```

### Admin endpoints

- `POST /api/admin/setup`
- `POST /api/admin/login`
- `GET /api/admin/analytics`
- `POST /api/admin/questions`
- `GET /api/admin/questions`
- `PUT /api/admin/questions/:id`
- `DELETE /api/admin/questions/:id`
- `POST /api/admin/careers`
- `GET /api/admin/careers`
- `GET /api/admin/users`
- `GET /api/admin/categories`

These functions are defined in `backend/routes/adminRoutes.js` and implemented in `backend/controllers/adminController.js`.

### Assessment endpoints

- `POST /api/assessments/start`
- `GET /api/assessments/next-question`
- `POST /api/assessments/submit-answer`
- `POST /api/assessments/complete`
- `GET /api/assessments/history`

These routes are protected by the auth middleware and are used to move the user through the psychometric assessment flow.

### Request tracking

All requests pass through the request ID middleware, which:

- reads the incoming `x-request-id` header if present;
- otherwise generates a UUID;
- attaches it to `req.requestId`;
- returns the same value in the `X-Request-ID` response header.

This improves debugging and traceability during development and support.

## Frontend pages and routes

The frontend has the following route structure in the current project state:

- `/` → Home page
- `/about-assessment` → About assessment page
- `/login` → User login page
- `/registration` → Registration page
- `/dashboard` → User dashboard
- `/test` → Assessment page
- `/report` → Result/report page
- `/admin` → Admin login page
- `/admin-dashboard` → Admin dashboard

The actual routing setup is in `frontend/src/App.jsx` and the page modules exist under `frontend/src/pages/`.

### Current frontend status

The project has implemented the structural flow of a complete app, including:

- page-level route architecture;
- navbar navigation;
- login/registration forms with validation;
- admin login screen;
- placeholder dashboard and assessment screens ready for further extension.

This means the app is no longer only a backend prototype; it has a real UI foundation and page flow connected to the backend endpoints.

## Local setup instructions

Follow these steps to set up the project locally.

### 1) Clone the repository

```bash
git clone <repository-url>
cd career-assessment-system
```

### 2) Install backend dependencies

```bash
cd backend
npm install
```

### 3) Configure environment variables

Create a `.env` file inside `backend/` with values similar to:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=career_assessment_db
JWT_SECRET=your_secure_jwt_secret
```

### 4) Create the database

```sql
CREATE DATABASE career_assessment_db;
```

The current project expects MySQL tables including `users`, `admins`, `questions`, `assessments`, `user_responses`, `careers`, and `categories`.

### 5) Start the backend server

The current project does not yet contain a full lifecycle script set in `backend/package.json`, so the reliable local command is:

```bash
cd backend
node server.js
```

If you want to add scripts for convenience, you can also use:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

The server should run at:

```text
http://localhost:5000
```

### 6) Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite development server and the frontend application at the default Vite port.

## Current priority and next steps

The project is now at a strong intermediate stage. The following items are the next realistic priorities:

1. Complete the remaining frontend screens and polish the design.
2. Connect the assessment UI to backend assessment APIs in real time.
3. Add result generation and career recommendation logic.
4. Finalize the admin dashboard for managing questions and careers.
5. Improve authentication guard flow and role-based protections.
6. Validate the end-to-end user journey from registration to result generation.

## Important note

The original README content has been preserved in intent and structure, and the new updates are appended as the current implementation status. This ensures the documentation remains clean, consistent, and aligned with the actual project state without removing earlier project context.
