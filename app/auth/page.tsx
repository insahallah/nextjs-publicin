// app/auth/page.tsx - Fixed version
'use client';

import { useState } from 'react';
import AwesomeLogin from '../../components/AwesomeLogin';
import AwesomeSignup from '../../components/AwesomeSignup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginData: any) => {
    setLoading(true);
    try {
      // Yahan aapka actual login logic aayega
      console.log('Login data:', loginData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Login successful!');
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (signupData: any) => {
    setLoading(true);
    try {
      // Yahan aapka actual signup logic aayega
      console.log('Signup data:', signupData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Signup successful!');
    } catch (error) {
      alert('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      {isLogin ? (
        <AwesomeLogin
          onLogin={handleLogin}
          onSwitchToSignup={() => setIsLogin(false)}
          onForgotPassword={handleForgotPassword}
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