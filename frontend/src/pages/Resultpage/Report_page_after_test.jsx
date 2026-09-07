import React, { useEffect, useState } from 'react';
import { getLatestResult } from '../../services/assessment';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FaDownload, FaTrophy, FaChartLine, FaCheckCircle, FaStar, FaBriefcase } from 'react-icons/fa';
import './report.css';

const ReportPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const loadResult = async () => {
      try {
        const res = await getLatestResult();
        if (res && res.result) {
          setResult(res.result);
        }
      } catch (err) {
        console.error('Failed to load latest result:', err);
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, []);

  const handleDownloadPDF = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const assessmentId = result.assessment_id;
      const downloadUrl = `http://localhost:5000/api/assessments/download-report/${assessmentId}`;

      const res = await fetch(downloadUrl, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `REACH_INDIA_Assessment_Report_${assessmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback static PDF link if available
      if (result.pdf_report_path) {
        const fileName = result.pdf_report_path.split('/').pop();
        window.open(`http://localhost:5000/reports/${fileName}`, '_blank');
      } else {
        alert('Failed to download PDF report. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p>{t('test.loading') || 'Loading assessment report...'}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>No Assessment Report Found</h3>
          <p className="muted">You have not completed any assessment test yet.</p>
        </div>
      </div>
    );
  }

  // Parse recommended careers (Top 3)
  const recommendations = (() => {
    try {
      return JSON.parse(result.recommended_careers);
    } catch (e) {
      return [];
    }
  })();

  const top3Careers = recommendations.slice(0, 3);

  const scores = [
    { title: 'Aptitude & Reasoning', score: result.aptitude_score || 75, color: '#3b82f6' },
    { title: 'Personality Alignment', score: result.personality_score || 80, color: '#8b5cf6' },
    { title: 'Career Interest Index', score: result.interest_score || 85, color: '#ec4899' },
    { title: 'Emotional Intelligence (EQ)', score: result.eq_score || 70, color: '#10b981' },
    { title: 'Practical Skills Readiness', score: result.skills_score || 78, color: '#f59e0b' },
  ];

  return (
    <div className="container report-wrap fade-up">
      <div className="report-card glass-card">
        {/* HEADER SECTION */}
        <div className="report-header">
          <div className="report-header-title">
            <h2>REACH INDIA Assessment Report</h2>
            <p className="muted">Personalized Career Evaluation & Performance Breakdown</p>
          </div>

          <button
            type="button"
            className="btn-premium download-pdf-btn"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <FaDownload style={{ marginRight: 8 }} />
            {downloading ? 'Downloading PDF...' : 'Download PDF Report'}
          </button>
        </div>

        {/* CANDIDATE META CARD */}
        <div className="candidate-meta-card glass-card">
          <div className="meta-item">
            <span className="meta-label">Candidate Name</span>
            <span className="meta-val">{user ? user.name : 'Candidate User'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Email Address</span>
            <span className="meta-val">{user ? user.email : 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Assessment ID</span>
            <span className="meta-val">#{result.assessment_id}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Completion Date</span>
            <span className="meta-val">{new Date(result.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* SECTION 1: TOP 3 RECOMMENDED CAREERS */}
        <div className="report-section">
          <h3 className="section-title">
            <FaTrophy style={{ color: '#f59e0b' }} /> Top 3 Recommended Career Pathways
          </h3>
          <p className="muted" style={{ fontSize: '0.92rem', marginBottom: '18px' }}>
            Based on your responses, these top 3 career fields entered by administration best suit your profile:
          </p>

          <div className="top-careers-grid">
            {top3Careers.length === 0 ? (
              <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
                General Professional Pathways recommended.
              </div>
            ) : (
              top3Careers.map((rec, idx) => (
                <div key={rec.id || idx} className="career-rec-card glass-card">
                  <div className="rec-rank-badge">Top #{idx + 1} Choice</div>

                  <div className="rec-card-header">
                    <div className="rec-icon"><FaBriefcase /></div>
                    <h4>{rec.career_name}</h4>
                  </div>

                  <div className="rec-match-bar-wrap">
                    <div className="rec-match-label">
                      <span>Match Compatibility</span>
                      <strong>{rec.match}% Match</strong>
                    </div>
                    <div className="match-bar-bg">
                      <div
                        className="match-bar-fill"
                        style={{ width: `${Math.min(100, rec.match)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rec-highlights">
                    <span className="highlight-tag"><FaCheckCircle /> High Interest Alignment</span>
                    <span className="highlight-tag"><FaStar /> Suitable Skill Domain</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 2: PERFORMANCE BREAKDOWN */}
        <div className="report-section" style={{ marginTop: '32px' }}>
          <h3 className="section-title">
            <FaChartLine style={{ color: '#3b82f6' }} /> Performance & Trait Scores Breakdown
          </h3>
          <p className="muted" style={{ fontSize: '0.92rem', marginBottom: '18px' }}>
            Detailed breakdown across aptitude, personality, interest, emotional intelligence, and skills:
          </p>

          <div className="scores-breakdown-list">
            {scores.map((s) => (
              <div key={s.title} className="score-row-card glass-card">
                <div className="score-row-header">
                  <span className="score-title">{s.title}</span>
                  <span className="score-badge" style={{ background: `${s.color}20`, color: s.color }}>
                    {s.score}%
                  </span>
                </div>

                <div className="score-bar-bg">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${Math.min(100, s.score)}%`, background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: ACTIONABLE GUIDANCE */}
        <div className="report-section guidance-box glass-card" style={{ marginTop: '32px' }}>
          <h4>Actionable Career Readiness Guidance</h4>
          <ul>
            <li>Focus on developing technical & analytical competencies for your #1 recommended career match.</li>
            <li>Explore relevant internships and certifications in your top 3 matching career fields.</li>
            <li>Download this PDF evaluation report to share with career counselors and mentors.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;