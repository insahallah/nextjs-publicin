'use client';

import { useState } from 'react';
import AwesomeLogin from '../../components/AwesomeLogin';
import AwesomeSignup from '../../components/AwesomeSignup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Called when login is successful
  const handleLoginSuccess = (token: string, userData: any) => {
    console.log("Login completed:", token, userData);
    // Redirection already handled in AwesomeLogin
  };

  // Signup handler
  const handleSignup = async (data: any) => {
    setLoading(true);
    try {
      console.log("Signup:", data);
      await new Promise((r) => setTimeout(r, 1000));
      alert("Signup successful! Please login.");
      setIsLogin(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      {isLogin ? (
        <AwesomeLogin
          onLoginSuccess={handleLoginSuccess}   // FIXED
          onSwitchToSignup={() => setIsLogin(false)}
          loading={loading}
        />
      ) : (
        <AwesomeSignup
          onSignup={handleSignup}
          onSwitchToLogin={() => setIsLogin(true)}
          loading={loading}
        />
      )}
    </div>
  );
}
