import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000/api', // Use this for web
  baseURL: `http://${[IP_ADDRESS]}/api`, // Use this for mobile/LAN
  timeout: 10000
});

api.setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

api.clearAuthToken = () => {
  delete api.defaults.headers.common.Authorization;
};

export default api;
