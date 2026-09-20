import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('campus_event_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('campus_event_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on initial app mount
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('campus_event_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('campus_event_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success && response.data) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('campus_event_token', receivedToken);
      localStorage.setItem('campus_event_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response.success && response.data) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('campus_event_token', receivedToken);
      localStorage.setItem('campus_event_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campus_event_token');
    localStorage.removeItem('campus_event_user');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('campus_event_user', JSON.stringify(newUser));
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
