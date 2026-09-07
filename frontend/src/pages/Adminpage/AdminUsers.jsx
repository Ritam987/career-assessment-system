import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaUserGraduate, FaEye, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [msg, setMsg] = useState({ text: '', error: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete candidate ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: `Candidate ${name} deleted successfully!`, error: false });
        setUsers(prev => prev.filter(u => u.id !== id));
        if (selectedUser?.id === id) setSelectedUser(null);
      } else {
        setMsg({ text: data.message || 'Failed to delete user', error: true });
      }
    } catch (err) {
      setMsg({ text: 'Error deleting candidate', error: true });
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Registered Candidates</h1>
          <p className="admin-users-sub">Manage all registered users and assessment takers.</p>
        </div>

        <div className="search-box-users glass-card">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search candidates by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {msg.text && (
        <div className={`admin-msg-alert ${msg.error ? 'alert-error' : 'alert-success'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="loading-box">Loading registered candidates...</div>
      ) : (
        <div className="users-table-card glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate Name</th>
                <th>Email Address</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-td">No candidates found matching search.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar-small">
                          <FaUserGraduate />
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="email-text"><FaEnvelope /> {user.email}</span>
                    </td>
                    <td>
                      <span className="date-text">
                        <FaCalendarAlt /> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action btn-view"
                          title="View Candidate Info"
                          onClick={() => setSelectedUser(user)}
                        >
                          <FaEye /> View
                        </button>
                        <button
                          className="btn-action btn-delete"
                          title="Delete Candidate"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User Info Modal */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="user-info-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Candidate Profile Information</h3>
              <button className="btn-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="user-info-body">
              <div className="info-row">
                <strong>ID:</strong> <span>#{selectedUser.id}</span>
              </div>
              <div className="info-row">
                <strong>Full Name:</strong> <span>{selectedUser.name}</span>
              </div>
              <div className="info-row">
                <strong>Email:</strong> <span>{selectedUser.email}</span>
              </div>
              <div className="info-row">
                <strong>Registered On:</strong> <span>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
