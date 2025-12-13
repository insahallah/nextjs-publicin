// app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user type based on your application needs
interface User {
  id: string;
  name: string;
  email: string;
  // Add any additional user properties you need
  avatar?: string;
  role?: string;
  createdAt?: string;
  [key: string]: any; // For any additional dynamic properties
}

// Define the shape of your authentication context
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPulsing: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Define props for AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with proper TypeScript typing
// Initialize with undefined, but type it as AuthContextType or undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  // State with proper typing
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  // Check if user is logged in on mount (runs once when component mounts)
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for auth token and user data in localStorage
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          // Parse user data and update state
          const parsedUser: User = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        // Always set loading to false when done
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array means this runs once on mount

  // Login function
  const login = (userData: User, token: string): void => {
    try {
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoggedIn(true);
      
      // You could add a success toast or redirect here
      console.log('Login successful');
    } catch (error) {
      console.error('Error during login:', error);
      throw error; // Re-throw for error handling in components
    }
  };

  // Logout function
  const logout = (): void => {
    try {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Update state
      setUser(null);
      setIsLoggedIn(false);
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>): void => {
    try {
      // Merge existing user data with new data
      const updatedUser = { ...user, ...userData } as User;
      
      // Update state
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      console.log('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error; // Re-throw for error handling in components
    }
  };

  // Context value object
  const contextValue: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    isPulsing,
    login,
    logout,
    updateUser,
    isAuthenticated: isLoggedIn, // Alias for compatibility
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    
    // Return a dummy/default context to prevent crashes
    const dummyContext: AuthContextType = {
      user: null,
      isLoggedIn: false,
      isAuthenticated: false,
      isLoading: false,
      isPulsing: false,
      login: () => {
        console.warn('Login called outside of AuthProvider');
      },
      logout: () => {
        console.warn('Logout called outside of AuthProvider');
      },
      updateUser: () => {
        console.warn('UpdateUser called outside of AuthProvider');
      },
    };
    
    return dummyContext;
  }
  
  return context;
};

// Optional: Export types for use in other components
export type { User, AuthContextType };