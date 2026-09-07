/**
 * ============================================================================
 * MAIN HOMEPAGE COMPONENT (MainHome.jsx)
 * ============================================================================
 * Purpose: Public landing page component featuring the hero graduation image,
 * floating glass card with career guidance title, call-to-action buttons for
 * beginning assessments or navigating to admin tools, and a 3-stat feature grid.
 * ============================================================================
 */

// 1. Core React & Router Imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Custom Context & Style Imports
import { useAuth } from '../../context/AuthContext';         // Auth context hook
import { useLanguage } from '../../context/LanguageContext'; // i18n translation context hook
import './home.css';                                         // Homepage layout stylesheet

// 3. React FontAwesome Vector Icons & Asset Imports
import { FaBolt, FaStar, FaUserGraduate } from 'react-icons/fa';
import heroImg from '../../assets/university-graduation-hero.jpg'; // High quality hero background asset

/**
 * MainHome Landing Page Component
 */
const MainHome = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Navigation handler for Begin Assessment button click
  const handleBeginAssessment = () => {
    if (user) {
      navigate('/assessment-intro');
    } else if (isAdmin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/registration');
    }
  };

  return (
    // Main content container with top margin clearance below sticky navbar
    <main className="home-page container">
      {/* Hero section card container */}
      <section className="hero-figure fade-up" aria-labelledby="home-hero-title">
        <div className="hero-image-wrap">
          {/* Background image covering hero container */}
          <img
            className="hero-image"
            src={heroImg}
            alt="Graduates tossing caps outside a university building"
            fetchPriority="high"
          />

          {/* Floating glassmorphism overlay container */}
          <div className="hero-overlay">
            <div className="glass-card hero-card">
              {/* Copy section: Kicker, Heading, and Description */}
              <div className="hero-copy">
                <span className="hero-kicker">Career clarity starts here</span>
                <h1 id="home-hero-title">Discover your professional strengths and career matches</h1>
                <p className="muted">
                  Complete our validated assessment to receive a concise report with recommended
                  career pathways and practical next steps.
                </p>
              </div>

              {/* Action Buttons Section */}
              <div className="hero-actions">
                {isAdmin ? (
                  <button type="button" className="btn-premium" onClick={() => navigate('/admin-dashboard')}>
                    Go to Admin Dashboard
                  </button>
                ) : (
                  <button type="button" className="btn-premium" onClick={handleBeginAssessment}>
                    {t('dashboard.startAssessment') || 'Begin Assessment'}
                  </button>
                )}
              </div>

              {/* Feature Stats Grid (3 columns on desktop, 1 column on mobile) */}
              <div className="hero-stats">
                {/* Stat 1: Objective Results */}
                <div className="glass-card hero-stat">
                  <div className="hero-stat-icon"><FaBolt /></div>
                  <div>
                    <div className="hero-stat-title">Objective Results</div>
                    <div className="muted hero-stat-copy">Standardized scoring for consistent recommendations.</div>
                  </div>
                </div>

                {/* Stat 2: Actionable Guidance */}
                <div className="glass-card hero-stat">
                  <div className="hero-stat-icon"><FaStar /></div>
                  <div>
                    <div className="hero-stat-title">Actionable Guidance</div>
                    <div className="muted hero-stat-copy">Clear next steps tailored to your profile.</div>
                  </div>
                </div>

                {/* Stat 3: Career Readiness */}
                <div className="glass-card hero-stat hero-stat-compact">
                  <div className="hero-stat-icon"><FaUserGraduate /></div>
                  <div>
                    <div className="hero-stat-title">Career Readiness</div>
                    <div className="muted hero-stat-copy">Built to support students and early professionals.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MainHome;
