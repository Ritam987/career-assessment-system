/**
 * ============================================================================
 * AUTHENTICATION API SERVICE (auth.js)
 * ============================================================================
 * Purpose: Axios HTTP client wrapper service for user authentication APIs
 * (User Registration, Login, and Logout). Sets global base URL defaults and
 * manages localStorage token storage.
 * ============================================================================
 */

// 1. Import Axios HTTP client library
import axios from 'axios';

// Set global base URL for all API calls
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true; // Send credentials/cookies with requests

/**
 * Sends user registration payload to backend endpoint
 * @param {Object} payload - Registration form fields object
 * @returns {Promise<Object>} Backend response data
 */
export const register = async (payload) => {
	try {
		const res = await axios.post('/auth/register', payload);
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : new Error('Registration failed');
	}
};

/**
 * Sends user login credentials to backend endpoint
 * @param {Object} payload - { email, password }
 * @returns {Promise<Object>} Backend response data containing token and user profile
 */
export const login = async (payload) => {
	try {
		const res = await axios.post('/auth/login', payload);
		// Persist JWT token to localStorage if returned in payload
		if (res.data && res.data.token) {
			localStorage.setItem('token', res.data.token);
		}
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : new Error('Login failed');
	}
};

/**
 * Calls backend user logout endpoint and clears client-side token storage
 * @returns {Promise<Object>} Backend logout response
 */
export const logout = async () => {
	try {
		const res = await axios.post('/auth/logout');
		localStorage.removeItem('token');
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : new Error('Logout failed');
	}
};
