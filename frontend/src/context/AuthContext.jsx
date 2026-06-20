import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on reload if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.success) {
          setUser(res.data.data);
        } else {
          // Token is invalid/expired
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { name, email, password };
      
      const res = await api.post('/auth/register', payload);
      
      if (res.data && res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 
                  err.response?.data?.errors?.[0]?.msg || 
                  'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data && res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 
                  err.response?.data?.errors?.[0]?.msg || 
                  'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
