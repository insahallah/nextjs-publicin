// app/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsLoggedIn(false);
    // Redirect to home
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isLoading,
      isPulsing,
      login,
      logout,
      updateUser,
      // Add isAuthenticated alias for compatibility
      isAuthenticated: isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('AuthContext not found. Make sure to wrap your app with AuthProvider');
    // Return dummy values to prevent crash
    return {
      user: null,
      isLoggedIn: false,
      isAuthenticated: false,
      isLoading: false,
      isPulsing: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {}
    };
  }
  return context;
};