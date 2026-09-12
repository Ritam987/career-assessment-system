/**
 * ============================================================================
 * AUTHENTICATION API SERVICE (auth.js)
 * ============================================================================
 * Purpose: Axios HTTP client wrapper service for user authentication APIs
 * (User Registration, Login, and Logout). Uses centralized axios instance
 * for consistent configuration.
 * ============================================================================
 */

// Import centralized axios instance
import axios from '../config/axios';

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
		if (err.response?.data) throw err.response.data;
		throw err;
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
		if (err.response?.data) throw err.response.data;
		throw err;
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

/**
 * Requests a 6-digit OTP code to be sent to user's email
 * @param {Object} payload - { email, purpose }
 */
export const sendOTP = async (payload) => {
	try {
		const res = await axios.post('/auth/send-otp', payload);
		return res.data;
	} catch (err) {
		if (err.response?.data) throw err.response.data;
		throw err;
	}
};

/**
 * Verifies submitted 6-digit OTP code
 * @param {Object} payload - { email, otp, purpose }
 */
export const verifyOTP = async (payload) => {
	try {
		const res = await axios.post('/auth/verify-otp', payload);
		return res.data;
	} catch (err) {
		if (err.response?.data) throw err.response.data;
		throw err;
	}
};

/**
 * Resets user password using 6-digit OTP code
 * @param {Object} payload - { email, otp, newPassword }
 */
export const resetPasswordWithOTP = async (payload) => {
	try {
		const res = await axios.post('/auth/reset-password-otp', payload);
		return res.data;
	} catch (err) {
		if (err.response?.data) throw err.response.data;
		throw err;
	}
};
