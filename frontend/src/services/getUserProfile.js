import axios from '../config/axios';

export const getUserProfile = async () => {
	try {
		const token = localStorage.getItem('token');
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		const res = await axios.get('/auth/profile', { headers });
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : err;
	}
};

export const updateUserProfile = async (formData) => {
	try {
		const token = localStorage.getItem('token');
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		const res = await axios.put('/auth/profile', formData, { headers });
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : err;
	}
};
