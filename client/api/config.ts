// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const config = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  getAuthHeader: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
  }
};

export default config;
