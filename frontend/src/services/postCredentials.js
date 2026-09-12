import axios from '../config/axios';

export const postRegistration = async (payload) => {
	try {
		const res = await axios.post('/auth/register', payload);
		return res.data;
	} catch (err) {
		throw err.response ? err.response.data : err;
	}
};
