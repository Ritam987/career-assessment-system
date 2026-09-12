import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Use centralized auth service instead of direct API calls
import { login } from '../../services/auth';
import OtpModal from '../../components/common/OtpModal';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('password_reset');

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loginUser } = useAuth();

  useEffect(() => {
    if (user || localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const currentIdentifier = watch('identifier');

  const onSubmit = async (data) => {
    setServerError('');
    const cleanEmail = (data.identifier || '').trim();
    const cleanPassword = (data.password || '').trim();

    try {
      const responseData = await login({ 
        email: cleanEmail, 
        password: cleanPassword 
      });

      loginUser(responseData.token, responseData.user);
      localStorage.setItem("user", JSON.stringify(responseData.user));
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login Error:", error);

      const isUnverified = error?.unverified || error?.response?.data?.unverified;
      const unverifiedEmail = error?.email || error?.response?.data?.email || cleanEmail;
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : null);

      if (isUnverified) {
        setServerError(msg || 'Your account email is not verified yet. Please enter the OTP sent to your email.');
        setOtpPurpose('signup');
        setOtpEmail(unverifiedEmail);
        setIsOtpModalOpen(true);
        try {
          const { sendOTP } = await import('../../services/auth');
          await sendOTP({ email: unverifiedEmail, purpose: 'signup' });
        } catch (otpErr) {
          console.warn('Auto send OTP failed:', otpErr);
        }
        return;
      }

      if (msg) {
        setServerError(msg);
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        setServerError('Login connection error. Please check your network or server status.');
      } else {
        setServerError('Unable to connect to server. Open this site via the laptop LAN IP and port 5173, not localhost.');
      }
    }
  };

  const handleForgotPassword = () => {
    setOtpPurpose('password_reset');
    setOtpEmail(currentIdentifier || '');
    setIsOtpModalOpen(true);
  };

  return (
    <div className="login-page">
      <div className="auth-shell">
        <div className="auth-brand" aria-label="Reach India brand">
          <div className="brand-mark">R</div>
          <div className="brand-text">
            <strong>REACH INDIA</strong>
            <span>Assessment Portal</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-heading">
            <h2>{t('auth.welcome')}</h2>
            <p>{t('auth.subtitle')}</p>
          </div>

          {serverError && (
            <div className="login-error-banner" role="alert">
              <span>{serverError.startsWith('✅') ? serverError : `❌ ${serverError}`}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="identifier">{t('auth.label')}</label>

              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <FaEnvelope />
                </span>

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
                  aria-label={showPassword ? t('auth.hide') : t('auth.show')}
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
                <span>{t('auth.remember')}</span>
              </label>

              <button type="button" className="forgot-password" onClick={handleForgotPassword}>
                {t('auth.forgot')}
              </button>
            </div>

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : t('auth.login')}
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

      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        initialEmail={otpEmail}
        purpose={otpPurpose}
        onSuccess={() => {
          if (otpPurpose === 'password_reset') {
            setServerError('✅ Password reset successful! You can now log in with your new password.');
          } else {
            setServerError('✅ Email verified and account activated successfully! You can now log in.');
          }
        }}
      />
    </div>
  );
};

export default Login;