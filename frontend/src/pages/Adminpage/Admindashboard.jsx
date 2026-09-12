import React, { useState, useEffect } from 'react';
import { addQuestion, getAllQuestions, deleteQuestion } from '../../services/fetchQuestion';
import { addCareer, getCareers } from '../../services/careers';
import './admin.css';
import { FaPlus, FaTrash, FaDatabase, FaUsers, FaClipboardList } from 'react-icons/fa';
import { apiUrl } from '../../config/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Admindashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalCareers: 0, completedAssessments: 0 });
    const [formData, setFormData] = useState({
        category_id: 1,
        question_text: '',
        question_type: 'MCQ',
        mapped_trait: 'General',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A'
    });
    const [careers, setCareers] = useState([]);

    useEffect(() => {
        fetchQuestions();
        fetchAnalytics();
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            const res = await getCareers();
            setCareers(res.careers || []);
        } catch (e) { console.error('Failed to fetch careers', e) }
    }

    const fetchQuestions = async () => {
        try {
            const data = await getAllQuestions();
            const questionsArray = Array.isArray(data) ? data : (data.questions || []);
            setQuestions(questionsArray);
        } catch (error) {
            console.error('Failed to fetch questions', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(apiUrl('/api/admin/analytics'), { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch analytics');
            const json = await res.json();
            setStats({
                totalUsers: json.totalUsers || 0,
                totalQuestions: json.totalQuestions || 0,
                totalCareers: json.totalCareers || 0,
                completedAssessments: json.completedAssessments || 0
            });
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        }
    };

    const exportQuestionsCSV = async () => {
        try {
            const data = await getAllQuestions();
            const qs = Array.isArray(data) ? data : (data.questions || []);
            const rows = qs.map(q => ({ id: q.id, text: q.question_text.replace(/\n/g,' '), correct: q.correct_option }));
            const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r=>Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'questions.csv'; a.click(); URL.revokeObjectURL(url);
        } catch (e) { console.error(e); alert('Export failed') }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addQuestion(formData);
            fetchQuestions();
            setFormData({ ...formData, question_text: '', option_a: '', option_b: '', option_c: '', option_d: '' });
        } catch (error) {
            alert(error.message || 'Error adding question');
        }
    };

    const handleAddCareer = async (e) => {
        e.preventDefault();
        const payload = {
            career_name: formData.mapped_trait || 'New Career',
            skill_domain: 'General',
            course_training: '',
            description: formData.question_text || '',
            required_traits: JSON.stringify({ traits: ['general'] })
        };
        try {
            await addCareer(payload);
            fetchCareers();
            alert('Career added');
        } catch (err) { console.error(err); alert('Failed to add career') }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this question?')) {
            try {
                await deleteQuestion(id);
                fetchQuestions();
            } catch (error) {
                alert('Error deleting question');
            }
        }
    };

    return (
        <div className="admin-wrap container">
            <header className="admin-header">
                <div>
                    <h2>Admin Dashboard</h2>
                    <p className="muted">Manage questions and view system analytics</p>
                </div>
                <div className="stat-grid">
                    <div className="stat glass-card"><FaUsers/> <div><div className="stat-num">{stats.totalUsers}</div><div className="muted">Users</div></div></div>
                    <div className="stat glass-card"><FaDatabase/> <div><div className="stat-num">{stats.totalQuestions}</div><div className="muted">Questions</div></div></div>
                    <div className="stat glass-card"><FaClipboardList/> <div><div className="stat-num">{stats.completedAssessments}</div><div className="muted">Completed</div></div></div>
                </div>
            </header>

            <section className="admin-main" >
                <aside className="admin-form glass-card">
                    <h3><FaPlus/> Add Question</h3>
                    <form onSubmit={handleSubmit} className="admin-form-inner">
                        <label>Question</label>
                        <textarea name="question_text" value={formData.question_text} onChange={handleChange} required rows={3} />

                        <div className="options-grid">
                            <input name="option_a" placeholder="Option A" value={formData.option_a} onChange={handleChange} required />
                            <input name="option_b" placeholder="Option B" value={formData.option_b} onChange={handleChange} required />
                            <input name="option_c" placeholder="Option C" value={formData.option_c} onChange={handleChange} />
                            <input name="option_d" placeholder="Option D" value={formData.option_d} onChange={handleChange} />
                        </div>

                        <div className="row">
                            <label>Correct Option</label>
                            <select name="correct_option" value={formData.correct_option} onChange={handleChange}>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-premium">Add Question</button>
                        </div>
                    </form>
                </aside>

                <div className="question-list">
                    <h3>Questions ({questions.length})</h3>
                    <div style={{margin:'12px 0'}}>
                        <button className="btn-ghost" onClick={exportQuestionsCSV}>Export Questions CSV</button>
                    </div>
                    <ul>
                        {questions.map((q) => (
                            <li key={q.id} className="question-item glass-card">
                                <div className="q-body">
                                    <div className="q-text">{q.question_text}</div>
                                    <div className="q-meta muted">Answer: <strong>{q.correct_option}</strong></div>
                                </div>
                                <div className="q-actions">
                                    <button className="btn-ghost" onClick={() => handleDelete(q.id)}><FaTrash/> Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h3 style={{marginTop:24}}>Careers ({careers.length})</h3>
                    <ul>
                        {careers.map(c=> (
                            <li key={c.id} className="question-item glass-card">
                                <div className="q-body">
                                    <div className="q-text">{c.career_name}</div>
                                    <div className="q-meta muted">Domain: <strong>{c.skill_domain}</strong></div>
                                </div>
                                <div className="q-actions">
                                    <button className="btn-ghost" onClick={()=> navigator.clipboard.writeText(c.required_traits)}>Copy Traits</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div style={{marginTop:24}} className="glass-card">
                        <h4>Overview</h4>
                        <div style={{maxWidth:560}}>
                            <Bar data={{ labels:['Users','Questions','Careers','Completed'], datasets:[{ label:'Counts', data:[stats.totalUsers, stats.totalQuestions, stats.totalCareers, stats.completedAssessments], backgroundColor:['#5B21B6','#5840EA','#8B5CF6','#C4B5FD'] }] }} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Admindashboard;