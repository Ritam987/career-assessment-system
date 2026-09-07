import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaClipboardList, FaChartLine, FaDownload, FaHome } from 'react-icons/fa';
import './AssessmentComplete.css';

const AssessmentComplete = () => {
  const navigate = useNavigate();
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    // Fetch latest completed assessment to get report PDF path
    fetch('/api/assessments/latest', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.assessment && data.assessment.report_pdf_path) {
          setReportUrl(data.assessment.report_pdf_path);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    } else {
      navigate('/report');
    }
  };

  return (
    <div className="complete-container">
      {/* Header */}
      <div className="complete-header">
        <button className="btn-back-complete" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="complete-title">Assessment Complete</h1>
          <p className="complete-subtitle">Great job! You have successfully completed the assessment.</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="complete-card glass-card">
        <div className="success-icon-badge">
          <FaCheck className="success-check-mark" />
        </div>

        <h2 className="thank-you-title">Thank You!</h2>
        <p className="thank-you-sub">You have successfully completed the assessment.</p>

        <div className="complete-features-list">
          <div className="feature-item">
            <div className="feature-icon purple-bg">
              <FaClipboardList />
            </div>
            <div>
              <strong className="feature-item-title">Your answers are saved</strong>
              <p className="feature-item-desc">We have recorded your responses.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon green-bg">
              <FaChartLine />
            </div>
            <div>
              <strong className="feature-item-title">Results are ready</strong>
              <p className="feature-item-desc">You can now view your results and career suggestions.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon orange-bg">
              <FaDownload />
            </div>
            <div>
              <strong className="feature-item-title">Download your report</strong>
              <p className="feature-item-desc">Get a detailed report of your results in PDF.</p>
            </div>
          </div>
        </div>

        <p className="next-step-prompt">Take the next step towards your better future!</p>

        {/* Buttons */}
        <div className="complete-actions">
          <button className="btn-complete-outline" onClick={() => navigate('/report')}>
            <FaChartLine /> <span>View Results</span>
          </button>
          
          <button className="btn-complete-primary" onClick={handleDownloadReport}>
            <FaDownload /> <span>Download Report</span>
          </button>

          <button className="btn-complete-outline" onClick={() => navigate('/dashboard')}>
            <FaHome /> <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentComplete;
