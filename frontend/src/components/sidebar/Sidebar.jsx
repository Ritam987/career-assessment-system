import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './sidebar.css';
import {
  FaTachometerAlt, FaUser, FaFileAlt, FaBell, FaCog, FaSignOutAlt,
  FaQuestionCircle, FaChartBar, FaUsers, FaBriefcase, FaGraduationCap, FaHeadset
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/multilanguage';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    if (user && !isAdmin) {
      fetch('/api/notifications', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user, isAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navText = (key, fallback) => getTranslation(`sidebar.${key}`, language) || fallback;

  return (
    <aside className="app-sidebar glass-card" aria-label="Sidebar">
      <div className="sidebar-inner">
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <FaGraduationCap />
          </div>
          <div className="brand-text">
            <span className="brand-title">Career Assessment</span>
            <span className="brand-subtitle">SYSTEM</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {user && (
              <>
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaTachometerAlt /> <span>{navText('dashboard', 'Dashboard')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/assessment-intro" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaFileAlt /> <span>{navText('takeAssessment', 'Take Assessment')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaChartBar /> <span>{navText('myResults', 'My Results')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaBell /> <span>{navText('notifications', 'Notifications')}</span>
                    {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaUser /> <span>{navText('myProfile', 'My Profile')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaCog /> <span>{navText('settings', 'Settings')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/help-support" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaQuestionCircle /> <span>{navText('helpSupport', 'Help & Support')}</span>
                  </NavLink>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                <li>
                  <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaTachometerAlt /> <span>Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaUsers /> <span>User Management</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/questions" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaFileAlt /> <span>Question Bank</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/careers" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaBriefcase /> <span>Careers & Domains</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/results" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaChartBar /> <span>Assessment Results</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaCog /> <span>System Settings</span>
                  </NavLink>
                </li>
              </>
            )}

            {!user && !isAdmin && (
              <>
                <li>
                  <NavLink to="/login">
                    <FaUser /> <span>Login</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/registration">
                    <FaFileAlt /> <span>Register</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Sidebar Support Widget */}
        {user && !isAdmin && (
          <div className="sidebar-support-card">
            <div className="support-card-head">
              <FaHeadset className="support-headset-icon" />
              <div>
                <strong>Need help?</strong>
                <p>Our support team is here to help you.</p>
              </div>
            </div>
            <button className="btn-support-contact" onClick={() => navigate('/help-support')}>
              Contact Support
            </button>
          </div>
        )}

        <div className="sidebar-footer">
          <button className="btn-logout-sidebar" onClick={handleLogout}>
            <FaSignOutAlt /> <span>{navText('logout', 'Logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
