'use client';

import { useAuth } from '@/app/providers';
import AwesomeLogin from './AwesomeLogin';
import AwesomeSignup from './AwesomeSignup';
import { useState } from 'react';

export default function LoginModalWrapper() {
  const { showLoginModal, handleLoginSuccess, closeLoginModal, isLoading } = useAuth();
  const [showSignupForm, setShowSignupForm] = useState(false);

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close login modal"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
        
        {/* Back Button for Signup Form */}
        {showSignupForm && (
          <button
            onClick={() => setShowSignupForm(false)}
            className="absolute -top-10 left-0 text-white hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Login</span>
          </button>
        )}
        
        {/* Modal Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
          {!showSignupForm ? (
            <AwesomeLogin
              onLogin={async (data: any) => {
                return new Promise<void>((resolve) => {
                  // Extract mobile from data - adjust based on what AwesomeLogin actually sends
                  const mobile = data.mobile || data.phone || data.username || '';
                  const name = data.name || 'User';
                  const email = data.email || `${mobile}@publicin.in`;
                  
                  const mockUserData = {
                    id: '1',
                    name: name,
                    email: email,
                    mobile: mobile,
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
                  };
                  handleLoginSuccess(mockUserData, `token_${Date.now()}`);
                  setShowSignupForm(false);
                  resolve();
                });
              }}
              onSwitchToSignup={() => {
                setShowSignupForm(true);
              }}
              showSocialLogin={true}
              loading={isLoading}
            />
          ) : (
            <AwesomeSignup
              onSignup={async (data: any) => {
                console.log('Signup data:', data);
                return new Promise<void>((resolve) => {
                  setTimeout(() => {
                    setShowSignupForm(false);
                    alert('Signup successful! Please login.');
                    resolve();
                  }, 1000);
                });
              }}
              onSwitchToLogin={() => {
                setShowSignupForm(false);
              }}
              loading={isLoading}
              showSocialSignup={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}