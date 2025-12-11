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
    // Redirect already handled inside AwesomeLogin
  };

  // Signup handler
  const handleSignup = async (signupData: any) => {
    setLoading(true);
    try {
      console.log('Signup data:', signupData);

      // Fake API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('Signup successful! Please login now.');
      setIsLogin(true);
      
    } catch (error) {
      alert('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      {isLogin ? (
        <AwesomeLogin
          onLoginSuccess={handleLoginSuccess}     // ✔ FIXED — Only one
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
