/**
 * ============================================================================
 * MAIN APPLICATION COMPONENT (App.jsx)
 * ============================================================================
 * Purpose: Top-level React Router component configuring global providers
 * (LanguageContext), navigation bars (Navbar, MobileBottomNav), and application
 * routes for public guest pages, protected user dashboard pages, and admin tools.
 * ============================================================================
 */

// 1. React & React Router Core Imports
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 2. Global Context Provider Imports
import { LanguageProvider } from './context/LanguageContext'; // Provides i18n translation state

// 3. Layout & Guard Components Imports
import Navbar from './components/navbar/Navbar';             // Sticky top navigation header
import MobileBottomNav from './components/navbar/MobileBottomNav'; // Smartphone bottom navigation bar
import AuthLayout from './components/layout/AuthLayout';     // Layout wrapper with responsive padding
import ProtectedRoute from './components/ProtectedRoute';   // Route protection guard for auth/admin routes

// 4. Public & Guest Screen Page Imports
import MainHome from './pages/Homepage/MainHome';            // Landing page with hero banner & features
import Login from './pages/Loginpage/Login';                // User login screen
import Registaration from './pages/Registrationpage/Registaration'; // User registration screen
import Adminlogin from './pages/Loginpage/Adminlogin';      // Admin authentication login screen

// 5. Protected User Page Screen Imports
import Userdashboard from './pages/Userpage/Userdashboard';  // User home dashboard page
import AssessmentIntro from './pages/Userpage/AssessmentIntro'; // Pre-test instructions page
import Testpage from './pages/Testpage/Testpage';            // Interactive timed assessment test page
import AssessmentComplete from './pages/Userpage/AssessmentComplete'; // Post-test congratulatory completion screen
import ReportPage from './pages/Resultpage/Report_page_after_test'; // Detailed assessment results & PDF report
import Profile from './pages/Userpage/Profile';              // User profile form page
import NotificationsPage from './pages/Userpage/NotificationsPage'; // User notification alerts feed
import HelpSupportPage from './pages/Userpage/HelpSupportPage'; // Support ticket & help center page
import UserSettings from './pages/Userpage/UserSettings';    // User account settings page

// 6. Protected Admin Panel Screen Imports
import Admindashboard from './pages/Adminpage/Admindashboard'; // Admin control panel home
import AdminUsers from './pages/Adminpage/AdminUsers';        // Admin user management table
import AdminQuestions from './pages/Adminpage/AdminQuestions'; // Admin question bank editor
import AdminCareers from './pages/Adminpage/AdminCareers';    // Admin career role mappings manager
import AdminResults from './pages/Adminpage/AdminResults';    // Admin assessment completion oversight table
import AdminSettings from './pages/Adminpage/AdminSettings';  // Admin system settings editor

/**
 * Root Application Component
 */
const App = () => {
  return (
    // Wrap entire application in LanguageProvider for instant EN / BN / HI translation support
    <LanguageProvider>
      <BrowserRouter>
        {/* Persistent Sticky Top Navigation Header */}
        <Navbar />

        {/* Dynamic Route Definitions */}
        <Routes>
          {/* A. Public Guest Routes */}
          <Route path="/" element={<MainHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registaration />} />

          {/* B. Protected User Routes (Requires User Authentication) */}
          <Route path="/dashboard" element={<ProtectedRoute><AuthLayout><Userdashboard /></AuthLayout></ProtectedRoute>} />
          <Route path="/assessment-intro" element={<ProtectedRoute blockAdmin={true}><AuthLayout><AssessmentIntro /></AuthLayout></ProtectedRoute>} />
          <Route path="/test" element={<ProtectedRoute blockAdmin={true}><AuthLayout><Testpage /></AuthLayout></ProtectedRoute>} />
          <Route path="/assessment-complete" element={<ProtectedRoute blockAdmin={true}><AuthLayout><AssessmentComplete /></AuthLayout></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><AuthLayout><ReportPage /></AuthLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AuthLayout><Profile /></AuthLayout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><AuthLayout><NotificationsPage /></AuthLayout></ProtectedRoute>} />
          <Route path="/help-support" element={<ProtectedRoute><AuthLayout><HelpSupportPage /></AuthLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AuthLayout><UserSettings /></AuthLayout></ProtectedRoute>} />

          {/* C. Protected Admin Routes (Requires Admin Role Credentials) */}
          <Route path="/admin" element={<Adminlogin />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly={true}><AuthLayout><Admindashboard /></AuthLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AuthLayout><AdminUsers /></AuthLayout></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute adminOnly={true}><AuthLayout><AdminQuestions /></AuthLayout></ProtectedRoute>} />
          <Route path="/admin/careers" element={<ProtectedRoute adminOnly={true}><AuthLayout><AdminCareers /></AuthLayout></ProtectedRoute>} />
          <Route path="/admin/results" element={<ProtectedRoute adminOnly={true}><AuthLayout><AdminResults /></AuthLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute adminOnly={true}><AuthLayout><AdminSettings /></AuthLayout></ProtectedRoute>} />
        </Routes>

        {/* Persistent Mobile Bottom Navigation Bar for Mobile Viewports */}
        <MobileBottomNav />
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
