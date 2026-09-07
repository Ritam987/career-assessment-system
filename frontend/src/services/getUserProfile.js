/**
 * ============================================================================
 * USER PROFILE API SERVICE (getUserProfile.js)
 * ============================================================================
 * Purpose: Axios HTTP client wrapper service for user profile management endpoints
 * (`GET /api/auth/profile` and `PUT /api/auth/profile`).
 * ============================================================================
 */

// 1. Import Axios library
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

/**
 * Fetches current authenticated user profile details from backend
 * @returns {Promise<Object>} User profile object payload
 */
export const getUserProfile = async () => {
	try {
		const token = localStorage.getItem('token');
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		const res = await axios.get('/auth/profile', { headers });
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : new Error('Failed to fetch user profile');
	}
};

/**
 * Sends updated profile details payload to backend for persistence
 * @param {Object} formData - Updated user profile fields object
 * @returns {Promise<Object>} Updated profile object payload
 */
export const updateUserProfile = async (formData) => {
	try {
		const token = localStorage.getItem('token');
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		const res = await axios.put('/auth/profile', formData, { headers });
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : new Error('Failed to update user profile');
	}
};
