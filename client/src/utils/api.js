const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = async (path, options = {}) => {
  const token = localStorage.getItem('guidex_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export default api;
