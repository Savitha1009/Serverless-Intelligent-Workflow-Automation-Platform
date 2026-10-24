import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USER } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('flowsphere_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const [token, setToken] = useState(() => localStorage.getItem('flowsphere_auth_token') || 'mock-jwt-token-xyz');

  useEffect(() => {
    if (user) {
      localStorage.setItem('flowsphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('flowsphere_user');
    }
  }, [user]);

  const login = async (email, password) => {
    // In mock mode, simulate successful login
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
      role: 'Cloud Architect',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    const mockToken = `mock-token-${Date.now()}`;
    setUser(newUser);
    setToken(mockToken);
    localStorage.setItem('flowsphere_auth_token', mockToken);
    return newUser;
  };

  const register = async (name, email, password) => {
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name,
      email: email,
      role: 'Developer',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    const mockToken = `mock-token-${Date.now()}`;
    setUser(newUser);
    setToken(mockToken);
    localStorage.setItem('flowsphere_auth_token', mockToken);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('flowsphere_auth_token');
    localStorage.removeItem('flowsphere_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, register, logout }}>
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
