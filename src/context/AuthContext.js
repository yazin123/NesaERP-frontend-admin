'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for existing auth token on initial load
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        
        if (token && storedUser) {
          // Optional: Add token validation logic here
          // For example, you might want to call an API to verify the token
          // const isValidToken = await validateToken(token);
          
          // if (isValidToken) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
          // } else {
          //   throw new Error('Invalid token');
          // }
        }
      } catch (error) {
        // If token validation fails, logout the user
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (token, userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setIsAuthenticated(true);
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);