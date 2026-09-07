import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } };
};

export const startAssessment = async () => {
    const res = await axios.post('/assessments/start', {}, authHeaders());
    return res.data;
};

export const getNextQuestion = async () => {
    const res = await axios.get('/assessments/next-question', authHeaders());
    return res.data;
};

export const submitAnswer = async (payload) => {
    const res = await axios.post('/assessments/submit-answer', payload, authHeaders());
    return res.data;
};

export const completeAssessment = async () => {
    const res = await axios.post('/assessments/complete', {}, authHeaders());
    return res.data;
};

export const getAssessmentHistory = async () => {
    const res = await axios.get('/assessments/history', authHeaders());
    return res.data;
};

export const getLatestResult = async () => {
    const res = await axios.get('/assessments/result/latest', authHeaders());
    return res.data;
};
