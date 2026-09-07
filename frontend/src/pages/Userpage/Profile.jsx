import React, { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/getUserProfile';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';
import { FaUser, FaMapMarkerAlt, FaGraduationCap, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { t } = useLanguage();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    age: '',
    education_level: '',
    preferred_field: '',
    career_goal: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    return computedAge >= 0 ? computedAge : '';
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res && res.user) {
          const u = res.user;
          let formattedDob = '';
          if (u.dob) {
            formattedDob = u.dob.includes('T') ? u.dob.split('T')[0] : u.dob;
          }
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            gender: u.gender || '',
            dob: formattedDob,
            age: u.age !== null && u.age !== undefined ? u.age : calculateAge(formattedDob),
            education_level: u.education_level || '',
            preferred_field: u.preferred_field || '',
            career_goal: u.career_goal || '',
            city: u.city || '',
            state: u.state || '',
            pincode: u.pincode || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    const computedAge = calculateAge(val);
    setForm((prev) => ({
      ...prev,
      dob: val,
      age: computedAge !== '' ? computedAge : prev.age
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await updateUserProfile(form);
      if (res && res.user) {
        const token = localStorage.getItem('token');
        loginUser(token, res.user);
      }
      setStatusMessage({ type: 'success', text: t('profile.successMsg') });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setStatusMessage({ type: 'error', text: t('profile.errorMsg') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card glass-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>{t('test.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container fade-up">
      <div className="profile-card glass-card">
        <div className="profile-header-wrap">
          <div className="profile-avatar">
            {form.name ? form.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-header">
            <h2>{t('profile.title') || 'User Profile'}</h2>
            <p>{t('profile.subtitle') || 'View and update your personal, location, and career information'}</p>
          </div>
        </div>

        {statusMessage.text && (
          <div className={`alert-box ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Section 1: Personal Information */}
          <div className="profile-section">
            <h3 className="profile-section-title">
              <FaUser /> {t('profile.personalInfo')}
            </h3>
            <div className="profile-grid">
              <div>
                <label className="field-label">{t('profile.name')} *</label>
                <input
                  type="text"
                  name="name"
                  className="field-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="field-label">{t('profile.email')} ({t('register.required')})</label>
                <input
                  type="email"
                  name="email"
                  className="field-input"
                  value={form.email}
                  disabled
                  title="Email cannot be edited"
                />
              </div>

              <div>
                <label className="field-label">{t('profile.phone')}</label>
                <input
                  type="text"
                  name="phone"
                  className="field-input"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('register.placeholderPhone')}
                />
              </div>

              <div>
                <label className="field-label">{t('profile.gender')}</label>
                <select
                  name="gender"
                  className="field-select"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">{t('profile.selectGender')}</option>
                  <option value="Male">{t('profile.male')}</option>
                  <option value="Female">{t('profile.female')}</option>
                  <option value="Other">{t('profile.other')}</option>
                </select>
              </div>

              <div>
                <label className="field-label">{t('profile.dob')}</label>
                <input
                  type="date"
                  name="dob"
                  className="field-input"
                  value={form.dob}
                  onChange={handleDobChange}
                />
              </div>

              <div>
                <label className="field-label">{t('profile.age')}</label>
                <input
                  type="number"
                  name="age"
                  className="field-input"
                  value={form.age}
                  onChange={handleChange}
                  placeholder={t('register.autoCalculated')}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className="profile-section">
            <h3 className="profile-section-title">
              <FaMapMarkerAlt /> {t('profile.locationInfo')}
            </h3>
            <div className="profile-grid">
              <div>
                <label className="field-label">{t('profile.city')}</label>
                <input
                  type="text"
                  name="city"
                  className="field-input"
                  value={form.city}
                  onChange={handleChange}
                  placeholder={t('register.placeholderCity')}
                />
              </div>

              <div>
                <label className="field-label">{t('profile.state')}</label>
                <input
                  type="text"
                  name="state"
                  className="field-input"
                  value={form.state}
                  onChange={handleChange}
                  placeholder={t('register.placeholderState')}
                />
              </div>

              <div>
                <label className="field-label">{t('profile.pincode')}</label>
                <input
                  type="text"
                  name="pincode"
                  className="field-input"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder={t('register.placeholderPincode')}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Education & Career */}
          <div className="profile-section">
            <h3 className="profile-section-title">
              <FaGraduationCap /> {t('profile.careerInfo')}
            </h3>
            <div className="profile-grid">
              <div>
                <label className="field-label">{t('profile.education')}</label>
                <input
                  type="text"
                  name="education_level"
                  className="field-input"
                  value={form.education_level}
                  onChange={handleChange}
                  placeholder="e.g. Higher Secondary, Bachelor's"
                />
              </div>

              <div>
                <label className="field-label">{t('profile.preferredField')}</label>
                <input
                  type="text"
                  name="preferred_field"
                  className="field-input"
                  value={form.preferred_field}
                  onChange={handleChange}
                  placeholder={t('register.placeholderField')}
                />
              </div>

              <div className="form-group-full">
                <label className="field-label">{t('profile.careerGoal')}</label>
                <textarea
                  name="career_goal"
                  className="field-textarea"
                  rows={3}
                  value={form.career_goal}
                  onChange={handleChange}
                  placeholder={t('register.placeholderCareer')}
                />
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn-profile-save" disabled={saving}>
              <FaSave style={{ marginRight: 8 }} />
              {saving ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
