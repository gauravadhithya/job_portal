import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage first (per-tab isolation), then localStorage
    const savedToken = sessionStorage.getItem('job_portal_token') || localStorage.getItem('job_portal_token');
    const savedUser = sessionStorage.getItem('job_portal_user') || localStorage.getItem('job_portal_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse cached user data', err);
        sessionStorage.removeItem('job_portal_token');
        sessionStorage.removeItem('job_portal_user');
        localStorage.removeItem('job_portal_token');
        localStorage.removeItem('job_portal_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data.token) {
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      setUser(userData);
      setToken(data.token);
      // Save to sessionStorage for tab-level isolation
      sessionStorage.setItem('job_portal_token', data.token);
      sessionStorage.setItem('job_portal_user', JSON.stringify(userData));
      localStorage.setItem('job_portal_token', data.token);
      localStorage.setItem('job_portal_user', JSON.stringify(userData));
    }
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await api.register({ name, email, password, role });
    // After register, auto-login if successful
    if (data._id) {
      return await login(email, password);
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('job_portal_token');
    sessionStorage.removeItem('job_portal_user');
    localStorage.removeItem('job_portal_token');
    localStorage.removeItem('job_portal_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        isRecruiter: user?.role === 'Recruiter',
        isJobSeeker: user?.role === 'Job Seeker',
        isAdmin: user?.role === 'Admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
