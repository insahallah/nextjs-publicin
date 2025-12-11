<<<<<<< HEAD
=======
// app/auth/page.tsx
>>>>>>> f26d11e (Updated auth page and login component)
'use client';

import { useState } from 'react';
import AwesomeLogin from '../../components/AwesomeLogin';
import AwesomeSignup from '../../components/AwesomeSignup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
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
=======
  // Called when AwesomeLogin reports login success
  const handleLoginSuccess = (token: string, userData: any) => {
    console.log('Login successful!', { token, userData });

    // Additional actions if needed
    // Redirecting is already handled inside AwesomeLogin
  };

  // Signup handler
  const handleSignup = async (signupData: any) => {
    setLoading(true);
    try {
      console.log('Signup data:', signupData);

      // Fake delay (simulate signup API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('Signup successful! Please login now.');
      setIsLogin(true);
    } catch (error) {
      alert('Signup failed. Please try again.');
>>>>>>> f26d11e (Updated auth page and login component)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      {isLogin ? (
        <AwesomeLogin
<<<<<<< HEAD
          onLoginSuccess={handleLoginSuccess}   // FIXED
=======
          onLoginSuccess={handleLoginSuccess}
>>>>>>> f26d11e (Updated auth page and login component)
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
