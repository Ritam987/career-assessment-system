/**
 * ============================================================================
 * POST CREDENTIALS REGISTRATION SERVICE (postCredentials.js)
 * ============================================================================
 * Purpose: Axios HTTP client service helper function to post user registration
 * credentials payload to backend `/api/auth/register` endpoint.
 * ============================================================================
 */

// 1. Import Axios library
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

/**
 * Posts registration fields payload to backend authentication router
 * @param {Object} payload - User registration parameters object
 * @returns {Promise<Object>} Backend response data
 */
export const postRegistration = async (payload) => {
	try {
		const res = await axios.post('/auth/register', payload);
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : new Error('Registration failed');
	}
};
