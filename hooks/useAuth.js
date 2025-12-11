// hooks/useAuth.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Open login modal
  const openLoginModal = useCallback((options = {}) => {
    window.dispatchEvent(
      new CustomEvent("openLoginModalFromBusiness", {
        detail: {
          mobileNumber: options.mobileNumber || "",
          redirectPath: options.redirectPath,
          context: options.context,
        },
      })
    );
  }, []);

  // Login success handler
  const handleLoginSuccess = useCallback((userData, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));

    setIsLoggedIn(true);
    setUser(userData);

    window.dispatchEvent(
      new CustomEvent("userLoggedIn", {
        detail: { user: userData },
      })
    );
  }, []);

  // Check authentication
  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Require auth
  const requireAuth = useCallback(
    (redirectPath = null, mobileNumber = null) => {
      if (!isLoggedIn && !isLoading) {
        openLoginModal({ redirectPath, mobileNumber });
        return false;
      }
      return true;
    },
    [isLoggedIn, isLoading, openLoginModal]
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    setIsLoggedIn(false);
    setUser(null);

    window.dispatchEvent(new Event("userLoggedOut"));
    router.push("/");
  }, [router]);

  // Initial auth + event listeners
  useEffect(() => {
    checkAuthStatus();

    const loginListener = () => checkAuthStatus();
    const logoutListener = () => checkAuthStatus();

    window.addEventListener("userLoggedIn", loginListener);
    window.addEventListener("userLoggedOut", logoutListener);

    return () => {
      window.removeEventListener("userLoggedIn", loginListener);
      window.removeEventListener("userLoggedOut", logoutListener);
    };
  }, [checkAuthStatus]);

  return {
    isLoggedIn,
    user,
    isLoading,
    checkAuthStatus,
    requireAuth,
    openLoginModal,
    handleLoginSuccess,
    logout,
  };
}
