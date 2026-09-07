/**
 * ============================================================================
 * MOBILE BOTTOM NAVIGATION BAR COMPONENT (MobileBottomNav.jsx)
 * ============================================================================
 * Purpose: Renders a fixed smartphone bottom navigation bar for small screens
 * (`@media (max-width: 768px)`). Displays quick tab links for User (Home, Assessment,
 * Results, Notifications, Profile) and Admin (Home, Users, Questions, Careers, Settings).
 * ============================================================================
 */

// 1. Core React & Router Imports
import React from 'react';
import { NavLink } from 'react-router-dom';

// 2. Vector Icons & Styles Import
import { FaHome, FaClipboardList, FaChartBar, FaBell, FaUser, FaUsers, FaFileAlt, FaBriefcase, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

/**
 * MobileBottomNav Component
 */
const MobileBottomNav = () => {
  const { user, isAdmin } = useAuth();

  // Hide mobile bottom navbar for unauthenticated guest visitors
  if (!user && !isAdmin) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {/* A. User Navigation Bottom Tabs */}
      {user && !isAdmin && (
        <>
          <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaHome />
            <span>Home</span>
          </NavLink>
          <NavLink to="/assessment-intro" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaClipboardList />
            <span>Assessment</span>
          </NavLink>
          <NavLink to="/report" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaChartBar />
            <span>Results</span>
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaBell />
            <span>Notifs</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaUser />
            <span>Profile</span>
          </NavLink>
        </>
      )}

      {/* B. Admin Navigation Bottom Tabs */}
      {isAdmin && (
        <>
          <NavLink to="/admin-dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaHome />
            <span>Home</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaUsers />
            <span>Users</span>
          </NavLink>
          <NavLink to="/admin/questions" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaFileAlt />
            <span>Questions</span>
          </NavLink>
          <NavLink to="/admin/careers" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaBriefcase />
            <span>Careers</span>
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default MobileBottomNav;
