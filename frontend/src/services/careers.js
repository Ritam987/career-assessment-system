import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const authHeader = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } };
}

export const addCareer = async (payload) => {
  const res = await axios.post('/admin/careers', payload, authHeader());
  return res.data;
}

export const getCareers = async () => {
  const res = await axios.get('/admin/careers', authHeader());
  return res.data;
}

export const updateCareer = async (id, payload) => {
  const res = await axios.put(`/admin/careers/${id}`, payload, authHeader());
  return res.data;
}

export const deleteCareer = async (id) => {
  const res = await axios.delete(`/admin/careers/${id}`, authHeader());
  return res.data;
}
