import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 second timeout
});

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('weatherAppToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('weatherAppToken');
  }, []);

  const fetchUserProfile = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/user/profile', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile. Logging out.", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchUserProfile(token);
  }, [token, fetchUserProfile]);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('weatherAppToken', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Login failed.' };
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Login failed. Please check your credentials.';
      
      if (err.code === 'ECONNABORTED') {
        message = 'Request timeout. Please check your internet connection.';
      } else if (err.response?.status === 400) {
        message = err.response.data?.message || 'Invalid credentials.';
      } else if (err.response?.status === 500) {
        message = 'Server error. Please try again later.';
      } else if (!err.response) {
        message = 'Network error. Please check your connection.';
      }
      
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post('/auth/register', { username, email, password });
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Registration error:', err);
      let message = 'Registration failed.';
      
      if (err.code === 'ECONNABORTED') {
        message = 'Request timeout. Please check your internet connection.';
      } else if (err.response?.status === 400) {
        message = err.response.data?.message || 'Registration failed.';
      } else if (err.response?.status === 500) {
        message = 'Server error. Please try again later.';
      } else if (!err.response) {
        message = 'Network error. Please check your connection.';
      }
      
      return { success: false, message };
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
