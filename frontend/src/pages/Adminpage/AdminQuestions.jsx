import React, { useState, useEffect } from 'react';
import { addQuestion, getAllQuestions, updateQuestion, deleteQuestion } from '../../services/fetchQuestion';
import './admin.css';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaFileCsv, FaTimes, FaCheck } from 'react-icons/fa';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const initialForm = {
    category_id: 1,
    question_text: '',
    question_type: 'MCQ',
    mapped_trait: 'IT / Technology',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getAllQuestions();
      const list = Array.isArray(data) ? data : (data.questions || []);
      setQuestions(list);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (q) => {
    setEditingQuestion(q);
    setFormData({
      category_id: q.category_id || 1,
      question_text: q.question_text || '',
      question_type: q.question_type || 'MCQ',
      mapped_trait: q.mapped_trait || 'General',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: q.correct_option || 'A',
      status: q.status || 'Active'
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, formData);
        setStatusMessage({ type: 'success', text: 'Question updated successfully!' });
        setEditingQuestion(null);
      } else {
        await addQuestion(formData);
        setStatusMessage({ type: 'success', text: 'Question added successfully!' });
      }
      setFormData(initialForm);
      fetchQuestions();
    } catch (error) {
      console.error('Submit question error:', error);
      setStatusMessage({ type: 'error', text: error.message || 'Failed to save question' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(id);
        setStatusMessage({ type: 'success', text: 'Question deleted successfully!' });
        fetchQuestions();
      } catch (error) {
        console.error('Delete question error:', error);
        setStatusMessage({ type: 'error', text: 'Failed to delete question' });
      }
    }
  };

  const exportQuestionsCSV = () => {
    try {
      const rows = questions.map((q) => ({
        id: q.id,
        category: q.mapped_trait || 'General',
        question: q.question_text ? q.question_text.replace(/\n/g, ' ') : '',
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct: q.correct_option || 'A'
      }));
      if (rows.length === 0) return alert('No questions to export');
      const headers = Object.keys(rows[0]).join(',');
      const csvContent = [
        headers,
        ...rows.map((r) =>
          Object.values(r)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Export failed');
    }
  };

  // Categories list
  const categoriesList = [
    'All',
    'IT / Technology',
    'Finance / Banking',
    'Marketing',
    'Healthcare',
    'Engineering',
    'General',
    'Aptitude',
    'Personality'
  ];

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const traitMatches =
      selectedCategoryFilter === 'All' ||
      (q.mapped_trait && q.mapped_trait.toLowerCase() === selectedCategoryFilter.toLowerCase());
    const searchMatches =
      !searchTerm ||
      (q.question_text && q.question_text.toLowerCase().includes(searchTerm.toLowerCase()));
    return traitMatches && searchMatches;
  });

  return (
    <div className="admin-wrap container fade-up">
      <header className="admin-header">
        <div>
          <h2>Question Management</h2>
          <p className="muted">Create, edit, search, filter, and manage assessment questions</p>
        </div>
        <button className="btn-ghost" onClick={exportQuestionsCSV}>
          <FaFileCsv style={{ marginRight: 6 }} /> Export CSV
        </button>
      </header>

      {statusMessage.text && (
        <div className={`alert-box ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="admin-main">
        {/* LEFT: FORM (ADD / EDIT) */}
        <aside className="admin-form glass-card">
          <h3>
            {editingQuestion ? <FaEdit /> : <FaPlus />}
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h3>

          <form onSubmit={handleSubmit} className="admin-form-inner">
            <div>
              <label>Domain / Category</label>
              <select name="mapped_trait" value={formData.mapped_trait} onChange={handleChange}>
                <option value="IT / Technology">IT / Technology</option>
                <option value="Finance / Banking">Finance / Banking</option>
                <option value="Marketing">Marketing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Engineering">Engineering</option>
                <option value="General">General</option>
                <option value="Aptitude">Aptitude</option>
                <option value="Personality">Personality</option>
              </select>
            </div>

            <div>
              <label>Question Text *</label>
              <textarea
                name="question_text"
                value={formData.question_text}
                onChange={handleChange}
                placeholder="Enter question statement..."
                required
                rows={3}
              />
            </div>

            <div className="options-grid">
              <div>
                <label>Option A *</label>
                <input
                  name="option_a"
                  placeholder="Option A"
                  value={formData.option_a}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Option B *</label>
                <input
                  name="option_b"
                  placeholder="Option B"
                  value={formData.option_b}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Option C</label>
                <input
                  name="option_c"
                  placeholder="Option C"
                  value={formData.option_c}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Option D</label>
                <input
                  name="option_d"
                  placeholder="Option D"
                  value={formData.option_d}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label>Correct Answer *</label>
              <select name="correct_option" value={formData.correct_option} onChange={handleChange}>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="form-actions" style={{ gap: 8 }}>
              {editingQuestion && (
                <button type="button" className="btn-ghost" onClick={handleCancelEdit}>
                  <FaTimes style={{ marginRight: 6 }} /> Cancel
                </button>
              )}
              <button type="submit" className="btn-premium">
                <FaCheck style={{ marginRight: 6 }} />
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        </aside>

        {/* RIGHT: QUESTION LIST & FILTERS */}
        <div className="question-list">
          <div className="question-filter-bar glass-card">
            <div className="search-input-wrap">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-filter-wrap">
              <label>Filter:</label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ margin: '16px 0 12px' }}>
            Questions ({filteredQuestions.length})
          </h3>

          {loading ? (
            <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              No questions found matching your filter.
            </div>
          ) : (
            <ul>
              {filteredQuestions.map((q) => (
                <li key={q.id} className="question-item glass-card">
                  <div className="q-body" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-domain">{q.mapped_trait || 'General'}</span>
                      <span className="badge badge-id">ID: #{q.id}</span>
                    </div>

                    <div className="q-text" style={{ fontSize: '1rem', marginBottom: 10 }}>
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
                  </div>

                  <div className="q-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 16 }}>
                    <button className="btn-ghost" onClick={() => handleEditClick(q)} title="Edit Question">
                      <FaEdit /> Edit
                    </button>
                    <button className="btn-ghost btn-delete" onClick={() => handleDelete(q.id)} title="Delete Question">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuestions;
