// components/AwesomeAuthModal.tsx
'use client';

import { useState, useEffect } from 'react';
import AwesomeLogin from './AwesomeLogin';
import AwesomeSignup from './AwesomeSignup';
import { X } from 'lucide-react';

interface AwesomeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'signup';
}

const AwesomeAuthModal: React.FC<AwesomeAuthModalProps> = ({
  isOpen,
  onClose,
  defaultView = 'login'
}) => {
  const [isLogin, setIsLogin] = useState(defaultView === 'login');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLogin(defaultView === 'login');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultView]);

  const handleLogin = async (loginData: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo validation
      if (loginData.email === 'demo@example.com' && loginData.password === 'password') {
        alert('Login successful!');
        onClose();
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (signupData: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Account created successfully!');
      onClose();
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      alert('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset feature coming soon!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className={`relative transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors duration-200 z-20 hover:scale-110 transform"
        >
          <X size={24} />
        </button>
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
    </div>
  );
};

export default AwesomeAuthModal;