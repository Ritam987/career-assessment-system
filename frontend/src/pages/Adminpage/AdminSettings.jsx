import React, { useState, useEffect } from 'react';
import { FaCog, FaSave, FaCheck, FaBuilding, FaEnvelope, FaPhone, FaClock, FaCheckDouble } from 'react-icons/fa';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_name: 'Career Assessment System',
    contact_email: 'support@careerassessment.com',
    contact_phone: '+91 98765 43210',
    test_duration_minutes: 30,
    passing_score: 50
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', error: false });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', error: false });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message || 'Settings updated successfully!', error: false });
      } else {
        setMsg({ text: data.message || 'Failed to update settings', error: true });
      }
    } catch (err) {
      setMsg({ text: 'Network error updating settings', error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-box">Loading system configuration...</div>;
  }

  return (
    <div className="admin-settings-container">
      <div className="admin-settings-header">
        <h1 className="admin-settings-title">System Settings & Parameters</h1>
        <p className="admin-settings-sub">Configure portal branding, default test durations, passing scores, and support contacts.</p>
      </div>

      {msg.text && (
        <div className={`admin-msg-alert ${msg.error ? 'alert-error' : 'alert-success'}`}>
          <FaCheck /> {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-settings-form glass-card">
        <h2>General & Test Parameters</h2>

        <div className="form-grid">
          <div className="form-group">
            <label><FaBuilding /> Site / Portal Name</label>
            <input
              type="text"
              required
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><FaEnvelope /> Official Support Email</label>
            <input
              type="email"
              required
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><FaPhone /> Official Support Phone</label>
            <input
              type="text"
              required
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><FaClock /> Default Test Duration (Minutes)</label>
            <input
              type="number"
              required
              min="5"
              max="180"
              value={settings.test_duration_minutes}
              onChange={(e) => setSettings({ ...settings, test_duration_minutes: parseInt(e.target.value) || 30 })}
            />
          </div>

          <div className="form-group">
            <label><FaCheckDouble /> Passing / Benchmark Score Threshold (%)</label>
            <input
              type="number"
              required
              min="1"
              max="100"
              value={settings.passing_score}
              onChange={(e) => setSettings({ ...settings, passing_score: parseInt(e.target.value) || 50 })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save-admin-settings" disabled={saving}>
            <FaSave /> {saving ? 'Saving System Settings...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
