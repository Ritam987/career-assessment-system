import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./adminlogin.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import axios from '../../config/axios';

const Adminlogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin, loginAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin || localStorage.getItem('adminToken')) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    const cleanEmail = (data.identifier || '').trim();
    const cleanPassword = (data.password || '').trim();

    try {
      const res = await axios.post('/admin/login', {
        email: cleanEmail,
        password: cleanPassword,
      });
      const responseData = res.data;

      loginAdmin(responseData.token, responseData.admin);
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Admin Login Error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setServerError(error.response.data.message);
      } else if (error.code === 'ECONNABORTED') {
        setServerError('Login timed out. Make sure the backend is running and you opened this site via the laptop LAN IP (not localhost on the phone).');
      } else {
        setServerError('Unable to connect to server. Open the site as http://LAPTOP_IP:5173 on the same Wi-Fi.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="auth-shell">
        <div className="auth-brand" aria-label="Reach India admin portal">
          <div className="brand-mark">R</div>
          <div className="brand-text">
            <strong>REACH INDIA</strong>
            <span>Assessment Portal</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-heading">
            <h2>{t('admin.welcome')}</h2>
            <p>{t('admin.subtitle')}</p>
          </div>

          {serverError && (
            <div className="login-error-banner" role="alert">
              <span>❌ {serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="identifier">{t('admin.label')}</label>

              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <FaEnvelope />
                </span>

                <input
                  id="identifier"
                  type="text"
                  placeholder="Enter mobile number or email"
                  {...register('identifier', {
                    required: 'Mobile number or email is required',
                  })}
                />
              </div>

              {errors.identifier && (
                <p className="error-message">{errors.identifier.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('admin.password')}</label>

              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <FaLock />
                </span>

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('admin.hide') : t('admin.show')}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" {...register('rememberMe')} />
                <span>{t('admin.remember')}</span>
              </label>

              <button type="button" className="forgot-password">
                {t('admin.forgot')}
              </button>
            </div>

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : t('admin.login')}
            </button>
          </form>

          <div className="signup-text">
            {t('admin.noAccount')}
            <button type="button" onClick={() => navigate('/registration')}>
              {t('admin.signUp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminlogin;