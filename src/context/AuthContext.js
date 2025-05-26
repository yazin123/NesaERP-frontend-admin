'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUserData: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to validate token and refresh if needed
  const validateToken = async (token) => {
    try {
      const response = await api.refreshToken();
      if (!response) {
        return { isValid: true }; // Keep session active if refresh fails
      }
      
      const { newToken, user: userData } = response;
      
      if (newToken) {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { isValid: true, user: userData };
      }
      
      return { isValid: true }; // Keep session if no new token
    } catch (error) {
      console.error('Token validation error:', error);
      return { isValid: true }; // Keep session on error
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const response = await api.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
          // Refresh user data in background
          refreshUserData();
        }
      } catch (error) {
        console.error('Auth status check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    let refreshInterval;

    if (isAuthenticated) {
      // Refresh token every 14 minutes (assuming 15-minute token expiry)
      refreshInterval = setInterval(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          await logout();
          return;
        }

        const { isValid, user: refreshedUser } = await validateToken(token);
        if (!isValid) {
          await logout();
        } else if (refreshedUser) {
          setUser(refreshedUser);
        }
      }, 14 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated]);

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      
      // Redirect based on user role
      if (['superadmin', 'admin'].includes(userData.role)) {
        router.push('/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout,
      refreshUserData
    }}>
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