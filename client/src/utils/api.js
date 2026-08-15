const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return ''; // Relative path for production Vercel serverless deployment
  }
  return 'http://localhost:5000';
};

const API_URL = getBaseUrl();

const api = async (path, options = {}) => {
  const token = localStorage.getItem('guidex_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    
    if (res.status === 401) {
      localStorage.removeItem('guidex_token');
      localStorage.removeItem('guidex_user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gdx_auth_expired'));
      }
      throw new Error('Your session has expired. Please sign in again.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    console.warn(`API Error [${path}]:`, err.message);
    throw err;
  }
};


export default api;
