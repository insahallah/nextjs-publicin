// components/AuthModalWrapper.tsx
'use client';

import { useState } from 'react';
import AwesomeLogin from './AwesomeLogin';
import AwesomeSignup from './AwesomeSignup';
import Swal from 'sweetalert2';
import { API_ENDPOINTS2 } from '@/configs/api';

// ✅ SweetAlert configuration
const SwalFixed = Swal.mixin({
  customClass: {
    container: 'z-[9999999]',
    popup: 'z-[99999999] rounded-2xl shadow-2xl',
    title: 'text-2xl font-bold text-gray-900',
    confirmButton: 'px-6 py-3 rounded-lg font-medium transition-colors duration-200',
    cancelButton: 'px-6 py-3 rounded-lg font-medium transition-colors duration-200'
  }
});

interface AuthModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'signup';
  preFilledMobile?: string;
}

export default function AuthModalWrapper({
  isOpen,
  onClose,
  defaultView = 'login',
  preFilledMobile = ''
}: AuthModalWrapperProps) {
  const [currentView, setCurrentView] = useState<'login' | 'signup'>(defaultView);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // ✅ Handle Login Success
  const handleLoginSuccess = async (token: string, userData: any) => {
    try {
      // Store user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: { user: userData } 
      }));

      // Show success alert
      SwalFixed.fire({
        title: 'Login Successful!',
        text: `Welcome back, ${userData.fullName || userData.mobile}!`,
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#ffffff',
        iconColor: '#10B981'
      }).then(() => {
        onClose();
        // Reload page to update UI
        window.location.reload();
      });
    } catch (error) {
      console.error('Login success handler error:', error);
    }
  };

  // ✅ Handle Signup
  const handleSignup = async (signupData: {
    fullName: string;
    mobile: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', signupData.fullName);
      formData.append('mobile', signupData.mobile);
      formData.append('password', signupData.password);
      formData.append('confirm_password', signupData.confirmPassword);

      // API call for signup
      const response = await fetch(API_ENDPOINTS2.AUTH.REGISTER, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (data.status === 'success' || data.success) {
        // Show success message
        SwalFixed.fire({
          title: 'Account Created!',
          text: 'Your account has been created successfully!',
          icon: 'success',
          confirmButtonText: 'Login Now',
          confirmButtonColor: '#10B981'
        }).then((result) => {
          if (result.isConfirmed) {
            // Switch to login view with pre-filled mobile
            setCurrentView('login');
          }
        });
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      SwalFixed.fire({
        title: 'Signup Failed',
        text: error.message || 'Failed to create account',
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle Forgot Password
  const handleForgotPassword = () => {
    SwalFixed.fire({
      title: 'Reset Password',
      html: `
        <div class="text-left">
          <p class="text-gray-600 mb-4">Enter your mobile number to reset password:</p>
          <input 
            type="tel" 
            id="reset-mobile" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter your mobile number"
            maxlength="10"
          />
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Send OTP',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      preConfirm: async () => {
        const mobileInput = document.getElementById('reset-mobile') as HTMLInputElement;
        const mobile = mobileInput?.value.trim();
        
        if (!mobile) {
          SwalFixed.showValidationMessage('Please enter mobile number');
          return false;
        }
        
        if (!/^\d{10}$/.test(mobile)) {
          SwalFixed.showValidationMessage('Please enter valid 10-digit number');
          return false;
        }
        
        // Call forgot password API
        try {
          const response = await fetch(API_ENDPOINTS2.AUTH.FORGOT_PASSWORD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile })
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            SwalFixed.fire({
              title: 'OTP Sent!',
              text: `OTP has been sent to ${mobile}`,
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#10B981'
            });
            return true;
          } else {
            throw new Error(data.message || 'Failed to send OTP');
          }
        } catch (error: any) {
          SwalFixed.showValidationMessage(error.message);
          return false;
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-50"
          aria-label="Close modal"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Modal Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
          {currentView === 'login' ? (
            <AwesomeLogin
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={() => setCurrentView('signup')}
              onForgotPassword={handleForgotPassword}
              loading={isLoading}
              className="border-0"
            />
          ) : (
            <AwesomeSignup
              onSignup={handleSignup}
              onSwitchToLogin={() => setCurrentView('login')}
              loading={isLoading}
              className="border-0"
              preFilledMobile={preFilledMobile}
            />
          )}
        </div>
      </div>

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px); 
          }
          to { 
            opacity: 1;
            transform: translateY(0); 
          }
        }
        
        .swal2-container {
          z-index: 999999999 !important;
        }
      `}</style>
    </div>
  );
}