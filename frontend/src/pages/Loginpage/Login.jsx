import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/LanguageContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

 const onSubmit = async (data) => {
    try {
      console.log("Sending Login Data:", data);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // if your backend expects the identifier to be named differently (like "email" or "username"), you should map it accordingly. For now, I'm sending it as is:
        // this is assuming your backend expects "email" and "password" in the request body. Adjust as necessary based on your backend implementation.
        body: JSON.stringify({
          email: data.identifier, // Adjust this key based on your backend's expected field name
          password: data.password
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Login Successful!");
        
        // Save the token and user data in localStorage
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("user", JSON.stringify(responseData.user));

        // Navigate to the dashboard or any other page after successful login
        navigate("/dashboard");
      } else {
        alert(`❌ Login Failed: ${responseData.message || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-shell">
        <div className="auth-brand" aria-label="Career Compass brand">
          <div className="brand-mark">C</div>
          <div className="brand-text">
            <strong>Career Compass</strong>
            <span>Assessment Portal</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-heading">
            <h2>{t('auth.welcome')}</h2>
            <p>{t('auth.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="identifier">{t('auth.label')}</label>

              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">E</span>

                <input
                  id="identifier"
                  type="text"
                  placeholder="Enter mobile number or email"
                  {...register("identifier", {
                    required: "Mobile number or email is required",
                  })}
                />
              </div>

              {errors.identifier && (
                <p className="error-message">{errors.identifier.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('auth.password')}</label>

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
                  {showPassword ? t('auth.hide') : t('auth.show')}
                </button>
              </div>

              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" {...register('rememberMe')} />
                <span>{t('auth.remember')}</span>
              </label>

              <button type="button" className="forgot-password">
                {t('auth.forgot')}
              </button>
            </div>

            <button type="submit" className="login-button">
              {t('auth.login')}
            </button>
          </form>

          <div className="signup-text">
            {t('auth.noAccount')}
            <button type="button" onClick={() => navigate('/registration')}>
              {t('auth.signUp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;