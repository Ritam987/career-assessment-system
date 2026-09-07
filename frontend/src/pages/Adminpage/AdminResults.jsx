import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilePdf, FaAward, FaChartBar, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import './AdminResults.css';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/admin/assessment-results', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = results.filter(r =>
    r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = (pdfPath) => {
    if (pdfPath) {
      window.open(pdfPath, '_blank');
    } else {
      alert('PDF report file path not available for this record.');
    }
  };

  return (
    <div className="admin-results-container">
      <div className="admin-results-header">
        <div>
          <h1 className="admin-results-title">Candidate Assessment Results</h1>
          <p className="admin-results-sub">Review completed tests, scores, and candidate PDF reports.</p>
        </div>

        <div className="search-box-results glass-card">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by candidate name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-box">Loading candidate assessment results...</div>
      ) : (
        <div className="results-table-card glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Assessment #</th>
                <th>Candidate</th>
                <th>Status</th>
                <th>Scores (A/P/I/E/S)</th>
                <th>Top Recommended Careers</th>
                <th>PDF Report</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-td">No assessment records found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.assessment_id}>
                    <td>#{item.assessment_id}</td>
                    <td>
                      <div>
                        <strong>{item.user_name}</strong>
                        <span className="sub-text">{item.user_email}</span>
                      </div>
                    </td>
                    <td>
                      {item.assessment_status === 'Completed' ? (
                        <span className="badge badge-completed"><FaCheckCircle /> Completed</span>
                      ) : (
                        <span className="badge badge-progress"><FaHourglassHalf /> In Progress</span>
                      )}
                    </td>
                    <td>
                      <div className="scores-pill-group">
                        <span className="score-tag tag-apt" title="Aptitude">{item.aptitude_score || 0}%</span>
                        <span className="score-tag tag-per" title="Personality">{item.personality_score || 0}%</span>
                        <span className="score-tag tag-int" title="Interest">{item.interest_score || 0}%</span>
                        <span className="score-tag tag-eq" title="EQ">{item.eq_score || 0}%</span>
                        <span className="score-tag tag-skl" title="Skills">{item.skill_score || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="careers-list-cell">
                        {item.recommended_career_1 ? (
                          <>
                            <span className="career-pill"><FaAward /> {item.recommended_career_1}</span>
                            {item.recommended_career_2 && <span className="career-pill-sec">{item.recommended_career_2}</span>}
                          </>
                        ) : (
                          <span className="text-muted-sm">Pending completion</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-download-pdf-admin"
                        onClick={() => handleDownloadPDF(item.report_pdf_path)}
                        disabled={!item.report_pdf_path}
                      >
                        <FaFilePdf /> PDF Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminResults;
