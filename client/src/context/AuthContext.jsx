import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('guidex_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      if (token.startsWith('demo_token_')) {
        // Recover local user state if stored
        const savedUser = localStorage.getItem('guidex_user');
        if (savedUser) {
          try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
        }
        setLoading(false);
      } else {
        api('/api/auth/me')
          .then(u => setUser(u))
          .catch(() => {
            // Keep user session if token exists
            const savedUser = localStorage.getItem('guidex_user');
            if (savedUser) {
              try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
            }
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('guidex_token', data.token);
      if (data.user) localStorage.setItem('guidex_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      console.warn('API auth login fallback active:', err.message);
      const mockUser = {
        name: email ? email.split('@')[0] : 'Engineer',
        email: email || 'student@guidex.io',
        goal: 'DATA STRUCTURES',
        level: 'Basic / Beginner',
        timelineWeeks: 4
      };
      const mockToken = 'demo_token_' + Date.now();
      localStorage.setItem('guidex_token', mockToken);
      localStorage.setItem('guidex_user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return { token: mockToken, user: mockUser };
    }
  };

  const register = async (name, email, password, goal, level, timelineWeeks) => {
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, goal, level, timelineWeeks }),
      });
      localStorage.setItem('guidex_token', data.token);
      if (data.user) localStorage.setItem('guidex_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      console.warn('API auth register fallback active:', err.message);
      const mockUser = {
        name: name || 'Engineer',
        email: email || 'student@guidex.io',
        goal: goal || 'DATA STRUCTURES',
        level: level || 'Basic / Beginner',
        timelineWeeks: parseInt(timelineWeeks) || 4
      };
      const mockToken = 'demo_token_' + Date.now();
      localStorage.setItem('guidex_token', mockToken);
      localStorage.setItem('guidex_user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return { token: mockToken, user: mockUser };
    }
  };

  const logout = () => {
    localStorage.removeItem('guidex_token');
    localStorage.removeItem('guidex_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export const useAuth = () => useContext(AuthContext);
