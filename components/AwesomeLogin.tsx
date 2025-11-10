// components/AwesomeLogin.tsx
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, LogIn } from 'lucide-react';
import AwesomeInput from './AwesomeInput';
import AwesomeButton from './AwesomeButton';

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

const AwesomeLogin: React.FC<AwesomeLoginProps> = ({
  onLogin,
  onSwitchToSignup,
  onForgotPassword,
  loading = false,
  className = '',
  showSocialLogin = false // Default false for your app
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onLogin(formData);
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
    <div className={`max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}>
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
          {/* ✅ FIXED: Mobile Input with proper spacing */}
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

          {/* ✅ FIXED: Password Input with proper spacing */}
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
            {/* ✅ FIXED: Password Toggle Button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-20"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                top: 'calc(50% + 12px)' // ✅ Perfect positioning with label
              }}
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
              onClick={onForgotPassword}
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

      {/* ✅ ADDED: Custom CSS to prevent any override issues */}
      <style jsx>{`
        /* Force input padding to prevent override */
        input {
          padding-left: 3rem !important;
          padding-right: 1rem !important;
        }
        
        /* Ensure icon positioning */
        .relative > div:first-child {
          left: 1rem !important;
        }
        
        /* Password toggle button positioning */
        .relative > button {
          right: 1rem !important;
        }
      `}</style>
    </div>
  );
};

export default AwesomeLogin;