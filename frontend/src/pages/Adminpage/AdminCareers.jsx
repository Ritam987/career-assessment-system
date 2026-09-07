import React, { useState, useEffect } from 'react';
import { getCareers, addCareer, updateCareer, deleteCareer } from '../../services/careers';
import { getAllQuestions } from '../../services/fetchQuestion';
import './admin.css';
import { FaLaptopCode, FaLandmark, FaBullhorn, FaStethoscope, FaCogs, FaBrain, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaQuestionCircle, FaBriefcase } from 'react-icons/fa';

const AdminCareers = () => {
  const [careers, setCareers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('IT / Technology');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const initialCareerForm = {
    career_name: '',
    skill_domain: 'IT / Technology',
    course_training: '',
    description: '',
    required_traits: '{"traits": ["analytical", "problem-solving"]}'
  };

  const [careerForm, setCareerForm] = useState(initialCareerForm);

  const categories = [
    { id: 'IT / Technology', name: 'IT & Technology', icon: <FaLaptopCode />, color: '#3b82f6' },
    { id: 'Finance / Banking', name: 'Finance & Banking', icon: <FaLandmark />, color: '#10b981' },
    { id: 'Marketing', name: 'Marketing & Sales', icon: <FaBullhorn />, color: '#f59e0b' },
    { id: 'Healthcare', name: 'Healthcare & Science', icon: <FaStethoscope />, color: '#ef4444' },
    { id: 'Engineering', name: 'Engineering & Ops', icon: <FaCogs />, color: '#8b5cf6' },
    { id: 'General', name: 'General & Soft Skills', icon: <FaBrain />, color: '#64748b' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const cData = await getCareers();
      setCareers(cData.careers || []);

      const qData = await getAllQuestions();
      const qList = Array.isArray(qData) ? qData : (qData.questions || []);
      setQuestions(qList);
    } catch (err) {
      console.error('Failed to load careers/questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCareerFormChange = (e) => {
    setCareerForm({ ...careerForm, [e.target.name]: e.target.value });
  };

  const handleAddCareerSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    try {
      await addCareer(careerForm);
      setStatusMessage({ type: 'success', text: 'Career role added successfully!' });
      setCareerForm(initialCareerForm);
      loadData();
    } catch (err) {
      console.error('Add career error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to add career role' });
    }
  };

  const handleDeleteCareer = async (id) => {
    if (window.confirm('Are you sure you want to delete this career path?')) {
      try {
        await deleteCareer(id);
        setStatusMessage({ type: 'success', text: 'Career deleted successfully!' });
        loadData();
      } catch (err) {
        console.error('Delete career error:', err);
        setStatusMessage({ type: 'error', text: 'Failed to delete career' });
      }
    }
  };

  // Filter careers for active selected category
  const filteredCareers = careers.filter((c) =>
    c.skill_domain && c.skill_domain.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  // Filter questions for active selected category
  const filteredQuestions = questions.filter((q) => {
    if (!q.mapped_trait) return selectedCategory === 'General';
    return q.mapped_trait.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory.includes('IT') && q.mapped_trait.includes('IT')) ||
      (selectedCategory.includes('Finance') && q.mapped_trait.includes('Finance'));
  });

  return (
    <div className="admin-wrap container fade-up">
      <header className="admin-header">
        <div>
          <h2>Careers & Category-Wise Questions</h2>
          <p className="muted">Explore categories to view associated career roles and domain-specific questions</p>
        </div>
      </header>

      {statusMessage.text && (
        <div className={`alert-box ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* CATEGORIES GRID */}
      <div className="categories-grid">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const catCareersCount = careers.filter((c) =>
            c.skill_domain && c.skill_domain.toLowerCase().includes(cat.id.toLowerCase())
          ).length;
          const catQuestionsCount = questions.filter((q) =>
            q.mapped_trait && q.mapped_trait.toLowerCase().includes(cat.id.toLowerCase())
          ).length;

          return (
            <div
              key={cat.id}
              className={`category-card glass-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ borderTop: `4px solid ${cat.color}` }}
            >
              <div className="cat-card-header">
                <div className="cat-icon-wrap" style={{ color: cat.color, background: `${cat.color}15` }}>
                  {cat.icon}
                </div>
                <h3>{cat.name}</h3>
              </div>

              <div className="cat-card-stats">
                <span><FaBriefcase /> {catCareersCount} Careers</span>
                <span><FaQuestionCircle /> {catQuestionsCount} Questions</span>
              </div>

              <div className="cat-card-action">
                {isSelected ? (
                  <span style={{ color: cat.color, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Active Category <FaChevronUp />
                  </span>
                ) : (
                  <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Click to View Questions <FaChevronDown />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPANDED CATEGORY DETAILS VIEW */}
      <div className="category-detail-section glass-card" style={{ marginTop: 24 }}>
        <div className="category-detail-header">
          <h3>
            Category: <span style={{ color: '#3b82f6' }}>{selectedCategory}</span>
          </h3>
          <p className="muted">
            Displaying associated career paths and all assessment questions for {selectedCategory}
          </p>
        </div>

        <div className="category-detail-grid">
          {/* LEFT: CAREERS IN THIS CATEGORY */}
          <div className="category-careers-col">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FaBriefcase style={{ color: '#3b82f6' }} /> Career Roles ({filteredCareers.length})
            </h4>

            {loading ? (
              <p>Loading careers...</p>
            ) : filteredCareers.length === 0 ? (
              <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
                No career roles added under this domain yet.
              </div>
            ) : (
              <ul className="category-careers-list">
                {filteredCareers.map((c) => (
                  <li key={c.id} className="career-item-card glass-card">
                    <div style={{ flex: 1 }}>
                      <strong>{c.career_name}</strong>
                      <p className="muted" style={{ fontSize: '0.86rem', margin: '4px 0' }}>
                        {c.description || 'No description provided.'}
                      </p>
                      {c.course_training && (
                        <small style={{ color: '#6366f1' }}>
                          <strong>Training:</strong> {c.course_training}
                        </small>
                      )}
                    </div>

                    <button
                      className="btn-ghost btn-delete"
                      onClick={() => handleDeleteCareer(c.id)}
                      title="Delete Career Role"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* ADD CAREER ROLE FORM */}
            <div className="add-career-card glass-card" style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 12 }}><FaPlus /> Add New Career Role</h4>
              <form onSubmit={handleAddCareerSubmit} className="admin-form-inner">
                <div>
                  <label>Career Role Name *</label>
                  <input
                    type="text"
                    name="career_name"
                    value={careerForm.career_name}
                    onChange={handleCareerFormChange}
                    placeholder="e.g. Software Engineer, Bank Manager"
                    required
                  />
                </div>

                <div>
                  <label>Skill Domain</label>
                  <select
                    name="skill_domain"
                    value={careerForm.skill_domain}
                    onChange={handleCareerFormChange}
                  >
                    <option value="IT / Technology">IT / Technology</option>
                    <option value="Finance / Banking">Finance / Banking</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Engineering">Engineering</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label>Role Description</label>
                  <textarea
                    name="description"
                    value={careerForm.description}
                    onChange={handleCareerFormChange}
                    placeholder="Brief description of duties..."
                    rows={2}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-premium">
                    Add Role
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: QUESTIONS IN THIS CATEGORY */}
          <div className="category-questions-col">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FaQuestionCircle style={{ color: '#10b981' }} /> Questions Mapped under {selectedCategory} ({filteredQuestions.length})
            </h4>

            {loading ? (
              <p>Loading questions...</p>
            ) : filteredQuestions.length === 0 ? (
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                No questions specifically mapped under {selectedCategory} yet.
              </div>
            ) : (
              <ul className="category-questions-list">
                {filteredQuestions.map((q) => (
                  <li key={q.id} className="category-question-card glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="badge badge-domain">{q.mapped_trait || selectedCategory}</span>
                      <span className="badge badge-id">ID: #{q.id}</span>
                    </div>

                    <div className="q-text" style={{ fontSize: '0.98rem', marginBottom: 10 }}>
                      {q.question_text}
                    </div>

                    <div className="q-options-display">
                      <div className={`opt-item ${q.correct_option === 'A' ? 'is-correct' : ''}`}>
                        <strong>A:</strong> {q.option_a}
                      </div>
                      <div className={`opt-item ${q.correct_option === 'B' ? 'is-correct' : ''}`}>
                        <strong>B:</strong> {q.option_b}
                      </div>
                      {q.option_c && (
                        <div className={`opt-item ${q.correct_option === 'C' ? 'is-correct' : ''}`}>
                          <strong>C:</strong> {q.option_c}
                        </div>
                      )}
                      {q.option_d && (
                        <div className={`opt-item ${q.correct_option === 'D' ? 'is-correct' : ''}`}>
                          <strong>D:</strong> {q.option_d}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCareers;
