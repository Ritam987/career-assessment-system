import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startAssessment, getNextQuestion, submitAnswer, completeAssessment } from '../../services/assessment';
import { useLanguage } from '../../context/LanguageContext';
import {
  FaBookmark, FaRegBookmark, FaArrowLeft, FaArrowRight, FaLightbulb,
  FaChevronDown, FaChevronUp, FaSave, FaClock, FaCheckCircle
} from 'react-icons/fa';
import './testpage.css';

const Testpage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState('');
  const [progress, setProgress] = useState({ current: 1, total: 20 });
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState('Personality');
  const [timerSeconds, setTimerSeconds] = useState(405); // 00:06:45

  const assessmentIdRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await startAssessment();
        if (res && res.assessmentId) assessmentIdRef.current = res.assessmentId;
        await fetchNext();
      } catch (err) {
        console.error('Start assessment error', err);
        setLoading(false);
      }
    };
    init();

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  const formatTimer = (sec) => {
    const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const fetchNext = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getNextQuestion();
      if (res.completed) {
        await completeAssessment();
        navigate('/assessment-complete');
        return;
      }
      setQuestion(res.question);
      setSelected('');
      if (res.index && res.total) {
        setProgress({ current: res.index, total: res.total });
      }
      if (res.question && res.question.category_name) {
        setActiveCategory(res.question.category_name);
      }
    } catch (err) {
      console.error('Fetch next question error', err);
      setErrorMsg('Failed to fetch question. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!question) return;
    if (!selected) {
      setErrorMsg(t('test.selectPrompt') || 'Please select an option to proceed');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await submitAnswer({ questionId: question.id, selectedOption: selected });
      await fetchNext();
    } catch (err) {
      console.error('Submit answer error', err);
      setErrorMsg('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBookmark = () => {
    if (!question) return;
    setBookmarked(!bookmarked);
    setBookmarks((prev) => ({ ...prev, [question.id]: !bookmarked }));
  };

  const handleSaveAndExit = () => {
    navigate('/dashboard');
  };

  const categories = [
    { name: 'Personality', label: 'Personality', count: 20 },
    { name: 'Interest', label: 'Interest', count: 20 },
    { name: 'Skills', label: 'Skills', count: 20 },
    { name: 'Work Preference', label: 'Work Preference', count: 20 }
  ];

  if (loading) {
    return (
      <div className="test-screen-container">
        <div className="glass-card loading-card">
          <p>{t('test.loading') || 'Loading question...'}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="test-screen-container">
        <div className="glass-card loading-card">
          <p>{t('test.noQuestion') || 'No questions remaining.'}</p>
          <button className="btn-primary-screen" onClick={() => navigate('/assessment-complete')}>
            View Completed Results
          </button>
        </div>
      </div>
    );
  }

  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="test-screen-container">
      {/* Top Header Category Tabs */}
      <div className="category-tabs-bar glass-card">
        {categories.map((cat, idx) => {
          const isActive = activeCategory.toLowerCase().includes(cat.name.toLowerCase());
          return (
            <div
              key={idx}
              className={`cat-tab-item ${isActive ? 'active' : ''}`}
            >
              <div className="tab-icon-wrap">
                <FaCheckCircle />
              </div>
              <div>
                <strong>{cat.label}</strong>
                <span>{cat.count} Questions</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="test-main-grid">
        {/* Left Column: Question Card & Banner */}
        <div className="question-left-col">
          <div className="question-card glass-card">
            {/* Question Card Header */}
            <div className="q-card-head">
              <div>
                <span className="q-cat-subtitle">{question.category_name || activeCategory} Assessment</span>
                <h3 className="q-number-title">Question {progress.current} of {progress.total}</h3>
              </div>
              <button
                className={`btn-bookmark ${bookmarked ? 'is-bookmarked' : ''}`}
                onClick={toggleBookmark}
              >
                {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            <div className="q-progress-bar-wrap">
              <div className="q-progress-bar-fill" style={{ width: `${percent}%` }}></div>
            </div>

            {/* Question Text */}
            <h2 className="main-q-text">{question.question_text}</h2>

            {errorMsg && <div className="q-error-alert">{errorMsg}</div>}

            {/* MCQ Options */}
            <div className="options-container">
              {['A', 'B', 'C', 'D'].map((key) => {
                const text = question[`option_${key.toLowerCase()}`];
                if (!text) return null;
                const isSelected = selected === key;
                return (
                  <label key={key} className={`option-item ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="option"
                      value={key}
                      checked={isSelected}
                      onChange={() => setSelected(key)}
                    />
                    <span className="radio-circle"></span>
                    <span className="option-label-text">{text}</span>
                  </label>
                );
              })}
            </div>

            {/* Card Footer Actions */}
            <div className="q-actions-row">
              <button className="btn-q-outline" disabled={progress.current <= 1}>
                <FaArrowLeft /> <span>Previous</span>
              </button>

              <button className="btn-q-outline" onClick={toggleBookmark}>
                <FaRegBookmark /> <span>Mark for Review</span>
              </button>

              <button className="btn-q-primary" onClick={handleSubmit} disabled={submitting}>
                <span>{submitting ? 'Saving...' : 'Next'}</span> <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="bottom-info-banner glass-card">
            <div className="banner-left">
              <div className="bulb-icon-wrap">
                <FaLightbulb />
              </div>
              <div>
                <strong>Remember</strong>
                <p>There are no right or wrong answers. Please answer honestly for accurate results.</p>
              </div>
            </div>

            <div className="banner-right">
              <div>
                <span className="pause-title">You can pause anytime!</span>
                <p className="pause-desc">Your progress is saved automatically.</p>
              </div>
              <button className="btn-save-exit" onClick={handleSaveAndExit}>
                <FaSave /> <span>Save & Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Progress & Palette */}
        <div className="palette-right-col">
          {/* Progress Card */}
          <div className="progress-summary-card glass-card">
            <h4>Your Progress</h4>
            <div className="progress-meta-row">
              <span>Overall Progress</span>
              <strong>{percent}%</strong>
            </div>
            <div className="overall-bar-wrap">
              <div className="overall-bar-fill" style={{ width: `${percent}%` }}></div>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-label">Completed</span>
                <strong className="stat-value">{progress.current - 1} / {progress.total}</strong>
              </div>
              <div className="stat-box">
                <span className="stat-label">Time Elapsed</span>
                <strong className="stat-value timer-text"><FaClock /> {formatTimer(timerSeconds)}</strong>
              </div>
            </div>
          </div>

          {/* Question Palette Accordions */}
          <div className="palette-card glass-card">
            <h4>Questions</h4>

            <div className="legend-row">
              <span className="legend-item"><span className="dot dot-answered"></span> Answered</span>
              <span className="legend-item"><span className="dot dot-current"></span> Current</span>
              <span className="legend-item"><span className="dot dot-unanswered"></span> Unanswered</span>
            </div>

            {categories.map((cat, catIdx) => {
              const isCurrentGroup = activeCategory.toLowerCase().includes(cat.name.toLowerCase());
              return (
                <div key={catIdx} className="cat-group-accordion">
                  <div className="cat-group-head">
                    <span>{cat.name} ({cat.count})</span>
                    <FaChevronDown />
                  </div>

                  {isCurrentGroup && (
                    <div className="q-grid-numbers">
                      {Array.from({ length: cat.count }, (_, i) => {
                        const qNum = i + 1;
                        const isCurrent = qNum === progress.current;
                        const isDone = qNum < progress.current;
                        return (
                          <button
                            key={qNum}
                            className={`q-num-btn ${isCurrent ? 'current' : isDone ? 'done' : ''}`}
                          >
                            {qNum}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testpage;