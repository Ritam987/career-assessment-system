
hello 
# Career Assessment System

## Project Overview

The Career Assessment System is a full-stack application designed to support career guidance, user profiling, and future assessment-driven recommendations. The backend is built with Node.js and Express.js and follows a clean MVC-inspired structure to keep routes, controllers, models, middleware, and configuration organized.

This repository currently includes:

- A backend API service in `backend/` with secure user registration and login flows.
- A database connection layer configured in `backend/config/db.js`.
- Request tracking middleware for debugging and traceability.
- A frontend application in `frontend/` built with React and Vite, which is set up for the next UI integration phase.

Note: The implementation currently present in this workspace uses a MySQL connection configured through `mysql2` in `backend/config/db.js`. The codebase is therefore aligned to the MySQL-based backend implementation that is currently active in the repository.

## Features Implemented

The backend already includes the following implemented capabilities:

- Express.js server setup with JSON parsing and CORS enabled for cross-origin requests.
- Database connectivity through `backend/config/db.js` using environment-based configuration values.
- User registration endpoint with validation and duplicate email prevention.
- Secure password hashing using `bcrypt` before storing user credentials.
- User login endpoint that verifies credentials and returns a JWT token.
- JWT-based authentication using `jsonwebtoken` with a configurable `JWT_SECRET` value.
- Unique request tracking middleware (`backend/middlewares/requestId.js`) that generates or reuses an `X-Request-ID` for every incoming request.
- Structured MVC-style folders for configuration, controllers, routes, middleware, and models.
- Clean separation between route definitions and business logic, enabling future extension for assessment, question, admin, and user management features.
- Environment-driven configuration for database connectivity and API security.

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
