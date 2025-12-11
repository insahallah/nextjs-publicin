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
              onLogin={(data) => {
                const mockUserData = {
                  id: '1',
                  name: data.name || 'User',
                  email: data.email || `${data.mobile}@publicin.in`,
                  mobile: data.mobile,
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
                };
                handleLoginSuccess(mockUserData, `token_${Date.now()}`);
                setShowSignupForm(false); // Reset on successful login
              }}
              onSwitchToSignup={() => {
                // ✅ Modal ke andar hi signup form show karein
                setShowSignupForm(true);
              }}
              showSocialLogin={true}
              loading={isLoading}
            />
          ) : (
            <AwesomeSignup
              onSignup={(data) => {
                console.log('Signup data:', data);
                // Add your signup API call here
                // After signup, you can:
                // 1. Automatically login the user
                // 2. Show success message and switch back to login
                // 3. Close modal
                
                // For example: Signup successful, now show login form
                setTimeout(() => {
                  setShowSignupForm(false);
                  alert('Signup successful! Please login.');
                }, 1000);
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