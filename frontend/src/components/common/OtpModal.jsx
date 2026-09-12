import React, { useState, useEffect } from 'react';
import { sendOTP, verifyOTP, resetPasswordWithOTP } from '../../services/auth';
import { FaEnvelope, FaKey, FaLock, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './OtpModal.css';

/**
 * OtpModal Component
 * Serves Email OTP Verification & Password Reset workflows.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Modal close handler callback
 * @param {string} props.initialEmail - Target user email address
 * @param {string} props.purpose - 'signup' | 'password_reset'
 * @param {Function} props.onSuccess - Callback upon successful verification or reset
 */
const OtpModal = ({ isOpen, onClose, initialEmail = '', purpose = 'signup', onSuccess }) => {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(purpose === 'password_reset' && !initialEmail ? 'request' : 'verify');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync props on open
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMsg('');
      setTimer(60);
      setCanResend(false);
      setStep(purpose === 'password_reset' && !initialEmail ? 'request' : 'verify');
    }
  }, [isOpen, initialEmail, purpose]);

  // Countdown timer for Resend OTP button
  useEffect(() => {
    let interval = null;
    if (isOpen && step === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, timer]);

  if (!isOpen) return null;

  // Step 1: Request OTP for Forgot Password
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await sendOTP({ email: email.trim(), purpose });
      setSuccessMsg(res.message || 'OTP code sent to your email!');
      setStep('verify');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to send OTP email.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await sendOTP({ email: email.trim(), purpose });
      setSuccessMsg(res.message || 'A new OTP code has been sent!');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP or Reset Password
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (purpose === 'password_reset') {
      if (!newPassword || newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match. Please try again.');
        return;
      }
    }

    setLoading(true);

    try {
      if (purpose === 'password_reset') {
        const res = await resetPasswordWithOTP({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim()
        });
        setSuccessMsg(res.message || 'Password reset successful!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res);
          onClose();
        }, 1500);
      } else {
        const res = await verifyOTP({
          email: email.trim(),
          otp: otp.trim(),
          purpose
        });
        setSuccessMsg(res.message || 'Verification successful!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="otp-modal-card">
        <button type="button" className="otp-modal-close" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>

        <div className="otp-modal-header">
          <div className="otp-header-badge">
            {purpose === 'password_reset' ? <FaLock /> : <FaCheckCircle />}
          </div>
          <h2>{purpose === 'password_reset' ? 'Reset Password' : 'Verify Email OTP'}</h2>
          <p>
            {step === 'request'
              ? 'Enter your registered email address to receive a 6-digit OTP code.'
              : `We sent a 6-digit code to ${email || 'your email'}.`}
          </p>
        </div>

        {error && (
          <div className="otp-alert otp-alert-error" role="alert">
            <span>❌ {error}</span>
          </div>
        )}

        {successMsg && (
          <div className="otp-alert otp-alert-success" role="alert">
            <span>✅ {successMsg}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOTP} className="otp-form">
            <div className="otp-field-group">
              <label htmlFor="otp-request-email">Email Address</label>
              <div className="otp-input-wrap">
                <FaEnvelope className="otp-field-icon" />
                <input
                  id="otp-request-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="otp-primary-btn" disabled={loading}>
              {loading ? <><FaSpinner className="spin-icon" /> Sending OTP...</> : 'Send OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitVerification} className="otp-form">
            <div className="otp-field-group">
              <label htmlFor="otp-code-input">6-Digit Verification Code</label>
              <div className="otp-input-wrap">
                <FaKey className="otp-field-icon" />
                <input
                  id="otp-code-input"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="otp-digit-input"
                  required
                />
              </div>
            </div>

            {purpose === 'password_reset' && (
              <>
                <div className="otp-field-group">
                  <label htmlFor="otp-new-password">New Password</label>
                  <div className="otp-input-wrap">
                    <FaLock className="otp-field-icon" />
                    <input
                      id="otp-new-password"
                      type="password"
                      placeholder="Enter new password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="otp-field-group">
                  <label htmlFor="otp-confirm-password">Confirm New Password</label>
                  <div className="otp-input-wrap">
                    <FaLock className="otp-field-icon" />
                    <input
                      id="otp-confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="otp-primary-btn" disabled={loading}>
              {loading ? (
                <><FaSpinner className="spin-icon" /> Processing...</>
              ) : purpose === 'password_reset' ? (
                'Reset Password'
              ) : (
                'Verify & Activate Account'
              )}
            </button>

            <div className="otp-resend-row">
              {canResend ? (
                <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading}>
                  Resend OTP Code
                </button>
              ) : (
                <span className="otp-timer-text">Resend code in <strong>{timer}s</strong></span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OtpModal;
