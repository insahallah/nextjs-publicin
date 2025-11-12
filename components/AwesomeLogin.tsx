'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, LogIn } from 'lucide-react';
import AwesomeInput from './AwesomeInput';
import AwesomeButton from './AwesomeButton';
import Swal from 'sweetalert2';

interface LoginData {
  mobile: string;
  password: string;
}

interface AwesomeLoginProps {
  onLogin: (data: LoginData) => void;
  onSwitchToSignup: () => void;
  onForgotPassword?: () => void;
  loading?: boolean;
  className?: string;
  showSocialLogin?: boolean;
}

// ✅ SweetAlert configuration (always above login box)
const SwalFixed = Swal.mixin({
  customClass: {
    container: 'z-[9999999]',
    popup: 'z-[99999999] rounded-2xl shadow-2xl',
    title: 'text-2xl font-bold text-gray-900',
    confirmButton: 'px-6 py-3 rounded-lg font-medium transition-colors duration-200',
    cancelButton: 'px-6 py-3 rounded-lg font-medium transition-colors duration-200'
  },
  didOpen: () => {
    const container = document.querySelector('.swal2-container') as HTMLElement;
    const popup = document.querySelector('.swal2-popup') as HTMLElement;
    if (container) {
      container.style.zIndex = '9999999';
      container.style.position = 'fixed';
      container.style.inset = '0';
    }
    if (popup) popup.style.zIndex = '99999999';
  }
});

const AwesomeLogin: React.FC<AwesomeLoginProps> = ({
  onLogin,
  onSwitchToSignup,
  onForgotPassword,
  loading = false,
  className = '',
  showSocialLogin = false
}) => {
  const [formData, setFormData] = useState<LoginData>({
    mobile: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 1) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSuccessAlert = () => {
    SwalFixed.fire({
      title: 'Login Successful!',
      text: 'Welcome back! You have been successfully logged in.',
      icon: 'success',
      confirmButtonText: 'Continue',
      confirmButtonColor: '#3B82F6',
      background: '#ffffff',
      color: '#1F2937',
      iconColor: '#10B981'
    });
  };

  const showErrorAlert = (message: string) => {
    SwalFixed.fire({
      title: 'Login Failed',
      text: message,
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#EF4444',
      background: '#ffffff',
      color: '#1F2937',
      iconColor: '#DC2626'
    });
  };

  const showForgotPasswordAlert = () => {
    SwalFixed.fire({
      title: 'Reset Password',
      html: `
        <div class="text-left">
          <p class="text-gray-600 mb-4">Enter your mobile number to reset your password:</p>
          <input 
            type="tel" 
            id="reset-mobile" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
            placeholder="Enter your mobile number"
            maxlength="10"
          />
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      background: '#ffffff',
      color: '#1F2937',
      preConfirm: () => {
        const mobileInput = document.getElementById('reset-mobile') as HTMLInputElement;
        const mobile = mobileInput?.value.trim();
        
        if (!mobile) {
          SwalFixed.showValidationMessage('Please enter your mobile number');
          return false;
        }
        
        if (!/^\d{10}$/.test(mobile)) {
          SwalFixed.showValidationMessage('Please enter a valid 10-digit mobile number');
          return false;
        }
        
        return mobile;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        SwalFixed.fire({
          title: 'Reset Link Sent!',
          text: `We've sent a password reset link to ${result.value}`,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10B981',
          background: '#ffffff'
        });
        
        if (onForgotPassword) {
          onForgotPassword();
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorAlert('Please fix the form errors before submitting.');
      return;
    }

    try {
      SwalFixed.fire({
        title: 'Signing In...',
        text: 'Please wait while we authenticate your credentials',
        allowOutsideClick: false,
        didOpen: () => {
          SwalFixed.showLoading();
        },
        background: '#ffffff'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onLogin(formData);
      
      SwalFixed.close();
      showSuccessAlert();
      
    } catch (error) {
      SwalFixed.close();
      showErrorAlert('Invalid mobile number or password. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      showForgotPasswordAlert();
    }
  };

  const handleChange = (field: keyof LoginData, value: string) => {
    if (field === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [field]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className={`max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 ${className}`}>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back!
          </h2>
          <p className="text-gray-600">Sign in to continue your awesome journey</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AwesomeInput
            label="Mobile Number"
            type="tel"
            placeholder="Enter your 10-digit mobile number"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            error={errors.mobile}
            required
            icon={<Phone size={18} />}
            maxLength={10}
          />

          <div className="relative">
            <AwesomeInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              required
              icon={<Lock size={18} />}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-20"
              onClick={() => setShowPassword(!showPassword)}
              style={{ top: 'calc(50% + 12px)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition duration-200"
              />
              <span className="ml-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
            >
              Forgot password?
            </button>
          </div>

          <AwesomeButton
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="w-full"
            icon={<LogIn size={18} />}
          >
            Sign In
          </AwesomeButton>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-500"
            >
              Create one now!
            </button>
          </p>
        </div>
      </div>

      {/* ✅ Z-Index & Overlay Fix for SweetAlert */}
      <style jsx global>{`
        .swal2-container {
          position: fixed !important;
          inset: 0 !important;
          z-index: 999999999 !important;
          backdrop-filter: blur(4px);
          background-color: rgba(0, 0, 0, 0.3) !important;
        }
        .swal2-popup {
          z-index: 999999999 !important;
          position: relative !important;
        }
        body.swal2-shown {
          overflow-y: hidden !important;
        }
        input {
          padding-left: 3rem !important;
          padding-right: 1rem !important;
        }
        .relative > div:first-child {
          left: 1rem !important;
        }
        .relative > button {
          right: 1rem !important;
        }
      `}</style>
    </div>
  );
};

export default AwesomeLogin;
