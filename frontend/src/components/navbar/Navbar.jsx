/**
 * ============================================================================
 * NAVIGATION BAR COMPONENT (Navbar.jsx)
 * ============================================================================
 * Purpose: Renders persistent sticky navigation bar with logo branding,
 * navigation links, language selection modal trigger, dark/light theme toggle,
 * user authentication state checks, and logout action buttons.
 * ============================================================================
 */

// 1. Core React Hooks & Dependencies
import React, { useEffect, useState } from 'react';
import './navbar.css';
import logo from '../../assets/logo.png'; // Platform brand logo image
import { Link, useNavigate } from 'react-router-dom';

// 2. Context Hooks
import { useLanguage } from '../../context/LanguageContext'; // i18n translation context
import { useAuth } from '../../context/AuthContext';         // User/Admin auth context

// 3. React FontAwesome Vector Icons
import {
  FaBars, FaTimes, FaMoon, FaSun, FaHome, FaClipboardList,
  FaGlobeAmericas, FaSignOutAlt, FaChartBar, FaSignInAlt, FaUserPlus, FaUserShield
} from 'react-icons/fa';

/**
 * Navbar UI Component
 */
export default function Navbar() {
  // Local component states
  const [menuOpen, setMenuOpen] = useState(false);                  // Mobile drawer menu state
  const [languageModalOpen, setLanguageModalOpen] = useState(false); // Language selector modal state
  const [dark, setDark] = useState(() => localStorage.getItem('themeDark') === 'dark'); // Theme toggle state

  const { language, setLanguage, languages, t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Synchronize Dark / Light mode CSS data-theme attribute on root HTML element
  useEffect(() => {
    const isDark = dark;
    const root = document.documentElement;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Set matching background gradients for HTML page body
    const pageBackground = isDark
      ? 'linear-gradient(180deg, #020817 0%, #0b1120 100%)'
      : 'linear-gradient(180deg, #f7fafc 0%, #eef2f7 100%)';

    root.style.background = pageBackground;
    document.body.style.background = pageBackground;
    document.body.style.color = isDark ? '#f8fafc' : '#0f1724';
    localStorage.setItem('themeDark', isDark ? 'dark' : 'light');
  }, [dark]);

  // Close mobile hamburger menu drawer
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Handle language selection from modal
  const handleLanguageSelect = (nextLanguage) => {
    setLanguage(nextLanguage);
    setLanguageModalOpen(false);
    closeMenu();
  };

  // Toggle theme mode between dark and light
  const toggleTheme = () => {
    setDark((current) => !current);
  };

  // Handle user/admin logout action
  const handleLogout = async () => {
    closeMenu();
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
  };

  // Helper flags for login status
  const isUserLoggedIn = Boolean(user && !isAdmin);
  const isAdminLoggedIn = Boolean(isAdmin);

  return (
    <>
      {/* Sticky Glassmorphism Header Bar */}
      <nav className="nav-container glass-card fade-up" aria-label="Main navigation">
        {/* Brand Logo & Title Link */}
        <Link to="/" className="brand-wrap" aria-label="Home" onClick={closeMenu}>
          <div className="image-container">
            <img src={logo} alt="Reach India logo" />
          </div>
          <div className="brand-copy">
            <span className="brand-name">REACH INDIA</span>
            <small>{t('nav.brandSubtitle') || 'Assessment Portal'}</small>
          </div>
        </Link>

        {/* Mobile Hamburger Drawer Button */}
        <button
          type="button"
          className={`hamburger-btn ${menuOpen ? 'active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>

        {/* Navigation Menu Container */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <ul className="ul1">
            {/* 1. Home Navigation Link */}
            <li>
              <Link to="/" onClick={closeMenu}>
                <FaHome style={{ marginRight: 8 }} /> {t('nav.home')}
              </Link>
            </li>

            {/* 2. Assessment / Admin Dashboard Link */}
            {isAdminLoggedIn ? (
              <li>
                <Link to="/admin-dashboard" onClick={closeMenu}>
                  <FaChartBar style={{ marginRight: 8 }} /> {t('nav.dashboard') || 'Dashboard'}
                </Link>
              </li>
            ) : (
              <li>
                <Link to="/assessment-intro" onClick={closeMenu}>
                  <FaClipboardList style={{ marginRight: 8 }} /> {t('nav.assessment')}
                </Link>
              </li>
            )}

            {/* 3. Language Selector Modal Trigger */}
            <li className="language-item">
              <button
                type="button"
                className="language-trigger"
                onClick={() => setLanguageModalOpen(true)}
              >
                <FaGlobeAmericas style={{ marginRight: 8 }} />
                {t('nav.language')}
              </button>
            </li>
          </ul>

          {/* Right Nav Actions (Login/Signup/Logout/Theme) */}
          <div className="nav-actions">
            {!isUserLoggedIn && !isAdminLoggedIn ? (
              /* Guest Actions: Login, Sign Up, Admin, Dark Mode */
              <>
                <Link to="/login" className="btn-nav-action btn-guest-login" onClick={closeMenu}>
                  <FaSignInAlt style={{ marginRight: 6 }} /> {t('nav.login')}
                </Link>

                <Link to="/registration" className="btn-nav-action btn-guest-signup" onClick={closeMenu}>
                  <FaUserPlus style={{ marginRight: 6 }} /> {t('nav.signUp')}
                </Link>

                <Link to="/admin" className="btn-nav-action btn-guest-admin" onClick={closeMenu}>
                  <FaUserShield style={{ marginRight: 6 }} /> {t('nav.admin')}
                </Link>
              </>
            ) : (
              /* Logged-In User Actions: Logout Button */
              <button type="button" className="btn-logout" onClick={handleLogout} title="Logout">
                <FaSignOutAlt style={{ marginRight: 6 }} /> {t('nav.logout')}
              </button>
            )}

            {/* Dark / Light Theme Toggle Button */}
            <button type="button" className="btn-premium theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {dark ? <FaMoon /> : <FaSun />}
            </button>
          </div>
        </div>
      </nav>

      {/* Multilingual Language Selector Modal */}
      {languageModalOpen && (
        <div className="language-modal-backdrop" onClick={() => setLanguageModalOpen(false)}>
          <div className="language-modal" onClick={(event) => event.stopPropagation()}>
            <div className="language-modal-header">
              <h3>{t('modal.title')}</h3>
              <button type="button" onClick={() => setLanguageModalOpen(false)}>
                {t('modal.close')}
              </button>
            </div>

            <div className="language-list">
              {languages.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={`language-option ${language === option.code ? 'selected' : ''}`}
                  onClick={() => handleLanguageSelect(option.code)}
                >
                  <span>{option.native}</span>
                  <small>{option.label}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
