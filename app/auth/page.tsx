// app/auth/page.tsx - Fixed version
'use client';

import { useState } from 'react';
import AwesomeLogin from '../../components/AwesomeLogin';
import AwesomeSignup from '../../components/AwesomeSignup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // This callback will be called when login is successful
  const handleLoginSuccess = (token: string, userData: any) => {
    console.log('Login successful!', { token, userData });
    // You can handle successful login here if needed
    // The actual login logic and redirection is already handled inside AwesomeLogin
  };

  // This will be called when signup is needed
  const handleSignup = async (signupData: any) => {
    setLoading(true);
    try {
      console.log('Signup data:', signupData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Signup successful! Please login with your credentials.');
      setIsLogin(true); // Switch to login after successful signup
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
          onLoginSuccess={handleLoginSuccess} // Changed from onLogin to onLoginSuccess
          onSwitchToSignup={() => setIsLogin(false)}
          loading={loading}
          // Note: We removed onForgotPassword prop since the component handles it internally
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