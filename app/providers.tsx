// app/providers.tsx
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';


// -------------------------
// Auth Context
// -------------------------
interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  handleLoginSuccess: (userData: any, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          setIsLoggedIn(true);
          setUser(JSON.parse(userData));
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const openLoginModal = useCallback(() => setShowLoginModal(true), []);
  const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

  const handleLoginSuccess = (userData: any, token: string) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setIsLoggedIn(true);
      setUser(userData);
      setShowLoginModal(false);
      
      // Show success message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Login successful!', type: 'success' }
        }));
      }
    } catch (error) {
      console.error('Login save error:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setIsLoggedIn(false);
      setUser(null);
      
      // Show logout message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Logged out successfully', type: 'info' }
        }));
        
        // Redirect to home after logout
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      showLoginModal,
      setShowLoginModal,
      openLoginModal,
      closeLoginModal,
      handleLoginSuccess,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// -------------------------
// Theme Provider (Optional)
// -------------------------
const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// -------------------------
// Main Providers Component
// -------------------------
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}