'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      if (token) {
        // Use the new endpoint to get user data with role information
        const response = await authApi.getUserWithRole();
        if (response.data) {
          const userData = response.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
        }
      } else if (storedUser) {
        // If we have stored user data but no token, clean up
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      if (response.data) {
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        
        // After login, fetch complete user data with role information
        const userResponse = await authApi.getUserWithRole();
        if (userResponse.data) {
          const userData = userResponse.data;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
          router.push('/dashboard');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.data) {
        // After profile update, fetch complete user data with role information
        const userResponse = await authApi.getUserWithRole();
        if (userResponse.data) {
          const userData = userResponse.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const changePassword = async (data) => {
    try {
      await authApi.changePassword(data);
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      updateProfile,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);