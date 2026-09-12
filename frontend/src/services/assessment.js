/**
 * ============================================================================
 * ASSESSMENT API SERVICE (assessment.js)
 * ============================================================================
 * Purpose: Axios wrapper for assessment-related API calls
 * Uses centralized axios instance for consistent configuration
 * ============================================================================
 */

import axios from '../config/axios';

export const startAssessment = async () => {
    const res = await axios.post('/assessments/start', {});
    return res.data;
};

export const getNextQuestion = async () => {
    const res = await axios.get('/assessments/next-question');
    return res.data;
};

export const submitAnswer = async (payload) => {
    const res = await axios.post('/assessments/submit-answer', payload);
    return res.data;
};

export const completeAssessment = async () => {
    const res = await axios.post('/assessments/complete', {});
    return res.data;
};

export const getAssessmentHistory = async () => {
    const res = await axios.get('/assessments/history');
    return res.data;
};

export const getLatestResult = async () => {
    const res = await axios.get('/assessments/result/latest');
    return res.data;
};
