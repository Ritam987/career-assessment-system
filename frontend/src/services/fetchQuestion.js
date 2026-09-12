/**
 * ============================================================================
 * QUESTION BANK API SERVICE (fetchQuestion.js)
 * ============================================================================
 * Purpose: Axios HTTP client wrapper service for Question Bank CRUD APIs
 * used by the Admin Panel (Create, Fetch All, Update, Delete questions).
 * Configures authorization headers dynamically using Bearer tokens.
 * ============================================================================
 */

// 1. Import Axios library
import axios from '../config/axios';

/**
 * Constructs Authorization header containing JWT Bearer token
 * @returns {Object} Axios request header config object
 */
const getAuthHeader = () => {
    // Prefer adminToken for admin endpoints, fallback to regular user token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }
    return { headers: { 'Content-Type': 'application/json' } };
};

/**
 * Sends request to add a new question to the database
 * @param {Object} questionData - Question fields payload
 * @returns {Promise<Object>} Backend response
 */
export const addQuestion = async (questionData) => {
    try {
        const response = await axios.post('/admin/questions', questionData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Server error adding question');
    }
};

/**
 * Fetches all questions from question bank for Admin Dashboard
 * @returns {Promise<Object>} Questions list payload
 */
export const getAllQuestions = async () => {
    try {
        const response = await axios.get('/admin/questions', getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Server error fetching questions');
    }
};

/**
 * Sends request to update an existing question by ID
 * @param {number|string} id - Question ID
 * @param {Object} questionData - Updated question fields
 * @returns {Promise<Object>} Backend response
 */
export const updateQuestion = async (id, questionData) => {
    try {
        const response = await axios.put(`/admin/questions/${id}`, questionData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Server error updating question');
    }
};

/**
 * Sends request to delete a question by ID
 * @param {number|string} id - Question ID
 * @returns {Promise<Object>} Backend response
 */
export const deleteQuestion = async (id) => {
    try {
        const response = await axios.delete(`/admin/questions/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Server error deleting question');
    }
};