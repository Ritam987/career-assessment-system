import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import './AssessmentIntro.css';

const AssessmentIntro = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/test');
  };

  return (
    <div className="assessment-intro-container">
      {/* Top Header */}
      <div className="intro-header">
        <button className="btn-back-intro" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="intro-title">Assessment Introduction</h1>
          <p className="intro-subtitle">Please read the following information before you start.</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="intro-card glass-card">
        {/* Section 1 */}
        <div className="intro-section">
          <h2>What is this assessment?</h2>
          <p>
            This assessment helps you understand your interests, skills and work preferences.
            It will suggest the best career options for you based on scientific psychometric models.
          </p>
        </div>

        <hr className="intro-divider" />

        {/* Section 2 */}
        <div className="intro-section">
          <h2>How it works?</h2>
          <div className="intro-steps">
            <div className="step-item">
              <span className="step-num">1</span>
              <p>Answer simple questions.</p>
            </div>
            <div className="step-item">
              <span className="step-num">2</span>
              <p>It takes about 20–30 minutes.</p>
            </div>
            <div className="step-item">
              <span className="step-num">3</span>
              <p>Your answers are safe and private.</p>
            </div>
            <div className="step-item">
              <span className="step-num">4</span>
              <p>Get your results and career suggestions.</p>
            </div>
          </div>
        </div>

        <hr className="intro-divider" />

        {/* Section 3 */}
        <div className="intro-section">
          <h2>Before you start, please remember:</h2>
          <ul className="remember-list">
            <li>
              <FaCheckCircle className="check-icon" />
              <span>There is no right or wrong answer.</span>
            </li>
            <li>
              <FaCheckCircle className="check-icon" />
              <span>Answer as per what you think and feel.</span>
            </li>
            <li>
              <FaCheckCircle className="check-icon" />
              <span>Be honest, so we can give you the best suggestions.</span>
            </li>
            <li>
              <FaCheckCircle className="check-icon" />
              <span>You can take a break anytime and continue later.</span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="intro-actions">
          <button className="btn-start-assessment" onClick={handleStart}>
            <span>Start Assessment</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentIntro;
