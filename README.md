# Career Assessment System

## Project Overview

The Career Assessment System helps users discover career paths through structured profiling, assessments, and personalized recommendations. It is a modular full-stack application with a backend API and a separately developed frontend client. The codebase is organized to make it straightforward to extend assessments, scoring, and administrative workflows while keeping authentication, configuration, and data access clearly separated.

Key points:

- Backend: Node.js + Express.js, following an MVC-inspired layout (routes, controllers, models, middleware).
- Database: MySQL (via `mysql2`) is the current database implementation and is configured in `backend/config/db.js`.
- Frontend: React + Vite (located in `frontend/`) — the UI scaffold is present and ready for feature wiring.
- Focus & status: Core backend functionality (authentication, request tracking, and user model) is implemented; the next phase is frontend development and assessment workflows.

This repository contains the backend API, configuration, middleware, and a frontend scaffold ready for integration and iteration.

## Features Implemented

Implemented (core):

- ✅ Authentication: user registration and login with validation, duplicate-email checks, and bcrypt password hashing. (See `backend/controllers/authController.js` and `backend/routes/authRoutes.js`)
- ✅ JWT-based auth: token issuance and verification using a configurable `JWT_SECRET`.
- ✅ Request tracing: request ID middleware (`backend/middlewares/requestId.js`) that reads or generates `X-Request-ID` and exposes it on `req.requestId` and responses.
- ✅ Database connectivity: MySQL connection setup in `backend/config/db.js` with environment-driven configuration values.
- ✅ Project structure: MVC-inspired layout separating routes, controllers, models, middleware, and utilities for maintainability.

In progress / scaffolded:

- ⚙️ Frontend scaffold: React + Vite app in `frontend/` is present and ready to be connected to backend endpoints.
- ⚙️ Utility modules: `backend/utils/` contains utilities such as `scoreCalculator.js` and `pdfGenerator.js` to be integrated with assessment flows.

Planned / next-phase features:

- 🚀 Assessment engine: questions, scoring rules, and result generation that produce personalized career recommendations.
- 🛠️ Admin interfaces: management endpoints and UI for creating/editing assessments, questions, and user outcomes.
- 📄 Reporting: PDF or exportable summaries of assessment results using `backend/utils/pdfGenerator.js`.

These lists capture the current capabilities and roadmap in a concise form to make it easier for contributors and maintainers to understand what is available and what to work on next.

## Project Structure

```text
career-assessment-system/
├── backend/
│   ├── .env
│   ├── .gitignore
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── assessmentController.js
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   └── userController.js
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
│   ├── utils/
│   │   ├── pdfGenerator.js
│   │   └── scoreCalculator.js
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   └── node_modules/
├── frontend/
│   ├── eslint.config.js
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   └── node_modules/
├── README.md
└── .git/
```

### Directory Responsibilities

- `backend/config/`: Database and environment-based configuration files.
- `backend/controllers/`: Business logic for requests such as registration, authentication, and future domain features.
- `backend/middlewares/`: Custom middleware for authentication, authorization, request IDs, and request-level tracking.
- `backend/models/`: Data access logic for interacting with the database.
- `backend/routes/`: Express route definitions that map HTTP endpoints to controller functions.
- `backend/utils/`: Utility modules for reusable calculations and generation logic.
- `frontend/`: React + Vite client application for the user-facing interface.

## API Documentation

The current active API implementation is focused on authentication and request tracking. The backend listens on `http://localhost:5000` by default unless overridden in the `.env` file.

### Health Check

- `GET /`
- Returns a simple running-status message from `backend/server.js`.

Example response:

```json
{
  "message": "Career Assessment System API is running..."
}
```

### Authentication Endpoints

#### 1) Register a new user

- `POST /api/auth/register`
- Route file: `backend/routes/authRoutes.js`
- Controller: `backend/controllers/authController.js`

Request body:

```json
{
  "full_name": "Ritam Das",
  "email": "ritam@example.com",
  "password": "StrongPassword123",
  "age": 25,
  "preferred_field": "Software Development",
  "career_goal": "Become a senior full-stack engineer"
}
```

Expected behavior:

- Checks whether the email already exists.
- Hashes the password using `bcrypt`.
- Inserts the user into the `users` table.
- Returns a `201 Created` response with a success message.

Example success response:

```json
{
  "message": "✅ User registered successfully!"
}
```

#### 2) Login a user

- `POST /api/auth/login`
- Route file: `backend/routes/authRoutes.js`
- Controller: `backend/controllers/authController.js`

Request body:

```json
{
  "email": "ritam@example.com",
  "password": "StrongPassword123"
}
```

Expected behavior:

- Finds the user by email.
- Validates the provided password against the stored hash.
- Signs a JWT token using the environment secret.
- Returns the token plus a lightweight user summary.

Example success response:

```json
{
  "message": "✅ Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Ritam Das",
    "email": "ritam@example.com",
    "preferred_field": "Software Development"
  }
}
```

### Request Tracking

All requests pass through `backend/middlewares/requestId.js`, which:

- Reads the incoming `x-request-id` header if provided.
- Otherwise generates a UUID value.
- Attaches it to `req.requestId`.
- Sends the same value back as the `X-Request-ID` response header.

This makes debugging and traceability easier during development and production support scenarios.

## Local Setup Instructions

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

Create a `.env` file in the `backend/` directory with the following values:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=career_assessment_db
JWT_SECRET=your_secure_jwt_secret
```

The code currently expects these values to match the MySQL database and JWT configuration used by `backend/config/db.js` and `backend/controllers/authController.js`.

### 4) Create the database and required table

Make sure MySQL is installed and running locally. Create the database used in the `.env` file:

```sql
CREATE DATABASE career_assessment_db;
```

The current `userModel.js` logic expects a `users` table with fields similar to the following:

```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  age INT,
  preferred_field VARCHAR(255),
  career_goal TEXT,
  profile_completed BOOLEAN DEFAULT TRUE
);
```

### 5) Start the backend server

The current backend package does not yet include explicit lifecycle scripts, so the recommended local scripts are:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Then run either command:

```bash
npm start
```

or

```bash
npm run dev
```

The server should start on:

```text
http://localhost:5000
```

### 6) Install and run the frontend

The frontend is a separate React + Vite application located in `frontend/`.

```bash
cd ../frontend
npm install
npm run dev
```

This starts the Vite development server for the UI so the frontend can later connect to the backend API.

## Current Priority & Next Steps

The application is now ready to move into the frontend development phase. The next major milestone is to design and build the user-facing React.js interface, define core UI screens, and connect those screens to the existing backend authentication and API workflows.

Our immediate priority is to design and develop the frontend interface using React.js and seamlessly connect it to our established backend API.
