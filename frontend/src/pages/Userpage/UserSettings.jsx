import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supportedLanguages } from '../../services/multilanguage';
import { FaGlobe, FaMoon, FaSun, FaBell, FaLock, FaCheck } from 'react-icons/fa';
import './UserSettings.css';

const UserSettings = () => {
  const { language, changeLanguage } = useLanguage();
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  const [emailNotif, setEmailNotif] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSaveSettings = () => {
    setSavedMsg('Settings updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">Account & System Settings</h1>
        <p className="settings-subtitle">Customize your language, theme, and notification preferences.</p>
      </div>

      {savedMsg && (
        <div className="settings-alert-success">
          <FaCheck /> {savedMsg}
        </div>
      )}

      <div className="settings-grid">
        {/* Language Selection Card */}
        <div className="settings-card glass-card">
          <div className="card-head">
            <FaGlobe className="card-head-icon purple-text" />
            <div>
              <h3>Language / ভাষা / भाषा</h3>
              <p>Select your preferred system language.</p>
            </div>
          </div>

          <div className="lang-options">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                className={`lang-btn ${language === lang.code ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
              >
                <span className="lang-name">{lang.label}</span>
                <span className="lang-native">({lang.native})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preferences Card */}
        <div className="settings-card glass-card">
          <div className="card-head">
            {theme === 'dark' ? <FaMoon className="card-head-icon amber-text" /> : <FaSun className="card-head-icon amber-text" />}
            <div>
              <h3>Theme Appearance</h3>
              <p>Choose between light mode and dark mode.</p>
            </div>
          </div>

          <div className="theme-toggle-row">
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => toggleTheme('light')}
            >
              <FaSun /> <span>Light Mode</span>
            </button>
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => toggleTheme('dark')}
            >
              <FaMoon /> <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Notifications Preference */}
        <div className="settings-card glass-card">
          <div className="card-head">
            <FaBell className="card-head-icon blue-text" />
            <div>
              <h3>Notifications</h3>
              <p>Control what emails and reminders you receive.</p>
            </div>
          </div>

          <div className="toggle-list">
            <label className="toggle-item">
              <div>
                <strong>Email Notifications</strong>
                <p>Receive assessment reports and updates by email.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
              />
            </label>

            <label className="toggle-item">
              <div>
                <strong>Assessment Reminders</strong>
                <p>Get notified if you have an uncompleted assessment.</p>
              </div>
              <input
                type="checkbox"
                checked={reminders}
                onChange={(e) => setReminders(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button className="btn-save-settings" onClick={handleSaveSettings}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
