import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./adminlogin.css"
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const Adminlogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

 const { loginAdmin } = useAuth();

 const onSubmit = async (data) => {
    try {
      console.log("Sending Admin Login Data:", data);

      // request to the backend for admin login
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        // if your backend expects the identifier to be named differently (like "email" or "username"), you should map it accordingly. For now, I'm sending it as is:
        body: JSON.stringify({
          email: data.identifier, 
          password: data.password
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Admin Login Successful!");
        
        // Save the token and admin data in localStorage
        loginAdmin(responseData.token, responseData.admin);

        // Navigate to the admin dashboard or any other page after successful login
        navigate("/admin-dashboard"); 
      } else {
        alert(`Login Failed: ${responseData.message || 'Invalid admin credentials'}`);
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      const msg = error && error.message ? error.message : JSON.stringify(error);
      alert(`❌ Server error: ${msg}`);
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="identifier">{t('admin.label')}</label>

              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">E</span>

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
                <span className="input-icon" aria-hidden="true">P</span>

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
                >
                  {showPassword ? t('admin.hide') : t('admin.show')}
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

            <button type="submit" className="login-button">
              {t('admin.login')}
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