/**
 * ============================================================================
 * USER DASHBOARD HOME COMPONENT (Userdashboard.jsx)
 * ============================================================================
 * Purpose: Main authenticated User Dashboard screen. Displays user welcome header,
 * purple hero banner, 4 key statistic cards, dynamic "Continue Your Journey" status
 * card, personalized recommendations card, and interactive career categories grid.
 * ============================================================================
 */

// 1. Core React & Router Imports
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. API Service Function Imports
import { getUserProfile } from '../../services/getUserProfile';
import { getAssessmentHistory } from '../../services/assessment';

// 3. React FontAwesome Vector Icons & Styles Import
import {
  FaArrowRight, FaClipboardList, FaChartLine, FaBookmark, FaMedal,
  FaRocket, FaStar, FaLaptopCode, FaBriefcase, FaHeartbeat, FaPalette, FaGraduationCap
} from 'react-icons/fa';
import './userdashboard.css';

/**
 * Userdashboard Component
 */
const Userdashboard = () => {
  // Local state hooks
  const [profile, setProfile] = useState(null);               // User profile data object
  const [history, setHistory] = useState([]);                 // User assessment history array
  const [latestAssessment, setLatestAssessment] = useState(null); // Most recent assessment record
  const navigate = useNavigate();

  // Load user profile and assessment history on mount
  useEffect(() => {
    const load = async () => {
      try {
        const p = await getUserProfile();
        setProfile(p.user);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }

      try {
        const h = await getAssessmentHistory();
        const hist = h.history || [];
        setHistory(hist);
        if (hist.length > 0) {
          setLatestAssessment(hist[0]);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };
    load();
  }, []);

  // Compute stats metrics
  const totalAssessments = history.length;
  const isCompleted = latestAssessment?.status === 'Completed';
  const progressPercent = isCompleted ? 100 : latestAssessment ? 50 : 0;

  // Career category cards metadata list
  const popularCategories = [
    { name: 'Technology', count: '15+ Careers', icon: <FaLaptopCode />, color: '#8b5cf6', bg: '#f3e8ff' },
    { name: 'Business', count: '12+ Careers', icon: <FaBriefcase />, color: '#f59e0b', bg: '#fef3c7' },
    { name: 'Healthcare', count: '10+ Careers', icon: <FaHeartbeat />, color: '#ec4899', bg: '#fce7f3' },
    { name: 'Design', count: '8+ Careers', icon: <FaPalette />, color: '#f97316', bg: '#ffedd5' },
    { name: 'Education', count: '6+ Careers', icon: <FaGraduationCap />, color: '#3b82f6', bg: '#dbeafe' }
  ];

  return (
    <div className="user-dashboard-wrapper">
      {/* 1. Greeting Header */}
      <div className="dashboard-top-greeting">
        <h1>Welcome Back! 👋</h1>
        <p>Let's continue your career journey{profile?.name ? `, ${profile.name}` : ''}</p>
      </div>

      {/* 2. Hero Purple Banner */}
      <div className="dashboard-hero-banner glass-card">
        <div className="banner-text-col">
          <h2>Discover the best career path for your future</h2>
          <p>Take assessments, explore careers and achieve your goals.</p>
          <button className="btn-banner-start" onClick={() => navigate('/assessment-intro')}>
            <span>Start Assessment</span>
            <FaArrowRight />
          </button>
        </div>
        <div className="banner-illustration">
          <div className="illus-circle">
            <FaGraduationCap className="illus-cap-icon" />
          </div>
        </div>
      </div>

      {/* 3. Four Live Stat Cards Grid */}
      <div className="dashboard-stats-grid">
        {/* Stat 1: Total Assessments */}
        <div className="dash-stat-card glass-card">
          <div className="stat-icon-wrap stat-purple">
            <FaClipboardList />
          </div>
          <div>
            <span className="stat-num">{totalAssessments}</span>
            <span className="stat-lbl">Assessments</span>
          </div>
        </div>

        {/* Stat 2: Completion Progress Percentage */}
        <div className="dash-stat-card glass-card">
          <div className="stat-icon-wrap stat-blue">
            <FaChartLine />
          </div>
          <div>
            <span className="stat-num">{progressPercent}%</span>
            <span className="stat-lbl">Progress</span>
          </div>
        </div>

        {/* Stat 3: Saved Items */}
        <div className="dash-stat-card glass-card">
          <div className="stat-icon-wrap stat-green">
            <FaBookmark />
          </div>
          <div>
            <span className="stat-num">{isCompleted ? 3 : 0}</span>
            <span className="stat-lbl">Saved</span>
          </div>
        </div>

        {/* Stat 4: Achievements & Badges */}
        <div className="dash-stat-card glass-card">
          <div className="stat-icon-wrap stat-amber">
            <FaMedal />
          </div>
          <div>
            <span className="stat-num">{isCompleted ? 1 : 0}</span>
            <span className="stat-lbl">Badges</span>
          </div>
        </div>
      </div>

      {/* 4. Dynamic "Continue Your Journey" Status Card */}
      <div className="dash-section-card glass-card">
        <div className="section-card-head">
          <div className="sec-head-title">
            <FaRocket className="sec-icon rocket-icon" />
            <div>
              <h3>Continue Your Journey</h3>
              <p>Your next step towards the right career</p>
            </div>
          </div>
        </div>

        <div className="sec-inner-box">
          {!latestAssessment ? (
            /* State A: No assessment started yet */
            <div className="empty-sec-state">
              <h4>No assessment taken yet</h4>
              <p>Take your first assessment to get started</p>
              <button className="btn-sec-action" onClick={() => navigate('/assessment-intro')}>
                Start Now
              </button>
            </div>
          ) : isCompleted ? (
            /* State B: Assessment completed */
            <div className="completed-sec-state">
              <h4>Assessment Completed Successfully!</h4>
              <p>Your report and recommendations are ready to view.</p>
              <button className="btn-sec-action" onClick={() => navigate('/report')}>
                View Results
              </button>
            </div>
          ) : (
            /* State C: Assessment currently in-progress */
            <div className="inprogress-sec-state">
              <h4>Assessment In-Progress</h4>
              <p>Continue where you left off to get your career recommendations.</p>
              <button className="btn-sec-action" onClick={() => navigate('/test')}>
                Resume Test
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recommended for You Section */}
      <div className="dash-section-card glass-card">
        <div className="section-card-head">
          <div className="sec-head-title">
            <FaStar className="sec-icon star-icon" />
            <div>
              <h3>Recommended for You</h3>
              <p>Based on your interests and skills</p>
            </div>
          </div>
        </div>

        <div className="sec-inner-box">
          {isCompleted ? (
            <div className="recommendations-ready-box">
              <p>You have customized recommendations based on your scores!</p>
              <button className="btn-sec-action" onClick={() => navigate('/report')}>
                Explore Recommended Careers
              </button>
            </div>
          ) : (
            <div className="empty-sec-state">
              <h4>No recommendations yet</h4>
              <p>Complete an assessment to get personalized career recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. Popular Career Categories Section */}
      <div className="dash-categories-section">
        <div className="cat-sec-head">
          <h3>Popular Career Categories</h3>
          <button className="btn-view-all" onClick={() => navigate('/assessment-intro')}>
            View All <FaArrowRight />
          </button>
        </div>

        <div className="categories-horizontal-scroll">
          {popularCategories.map((cat, idx) => (
            <div key={idx} className="pop-cat-card glass-card" onClick={() => navigate('/assessment-intro')}>
              <div className="pop-cat-icon" style={{ background: cat.bg, color: cat.color }}>
                {cat.icon}
              </div>
              <strong className="pop-cat-name">{cat.name}</strong>
              <span className="pop-cat-count">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Userdashboard;
