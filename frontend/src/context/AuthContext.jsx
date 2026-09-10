import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('civicpulse_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.warn('Session check failed, clearing token');
      localStorage.removeItem('civicpulse_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem('civicpulse_token', userData.token);
      setUser(userData);
      return userData;
    }
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem('civicpulse_token', userData.token);
      setUser(userData);
      return userData;
    }
  };

  const logout = () => {
    localStorage.removeItem('civicpulse_token');
    setUser(null);
  };

  // Demo Quick Login helper
  const demoLoginAs = async (role) => {
    const credentialsMap = {
      citizen: { email: 'citizen@civicpulse.city', password: 'password123' },
      worker: { email: 'worker@civicpulse.city', password: 'password123' },
      officer: { email: 'officer@civicpulse.city', password: 'password123' },
      admin: { email: 'admin@civicpulse.city', password: 'password123' }
    };

    const creds = credentialsMap[role] || credentialsMap.citizen;
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      demoLoginAs
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
