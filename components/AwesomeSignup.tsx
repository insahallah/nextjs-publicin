// components/AwesomeSignup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Phone, Lock, User, UserPlus } from 'lucide-react';
import AwesomeInput from './AwesomeInput';
import AwesomeButton from './AwesomeButton';

interface SignupData {
  fullName: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

interface AwesomeSignupProps {
  onSignup: (data: SignupData) => void;
  onSwitchToLogin: () => void;
  loading?: boolean;
  className?: string;
  showSocialSignup?: boolean;
  preFilledMobile?: string; // ✅ NEW: Pre-filled mobile prop
}

const AwesomeSignup: React.FC<AwesomeSignupProps> = ({
  onSignup,
  onSwitchToLogin,
  loading = false,
  className = '',
  showSocialSignup = false,
  preFilledMobile = '' // ✅ NEW: Pre-filled mobile
}) => {
  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    mobile: preFilledMobile, // ✅ NEW: Auto-fill mobile from prop
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ NEW: Update mobile when preFilledMobile changes
  useEffect(() => {
    if (preFilledMobile) {
      const digitsOnly = preFilledMobile.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ 
        ...prev, 
        mobile: digitsOnly 
      }));
    }
  }, [preFilledMobile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSignup(formData);
    }
  };

  const handleChange = (field: keyof SignupData, value: string) => {
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
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-600">
            Sign up to get started with your account
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AwesomeInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            error={errors.fullName}
            required
            icon={<User size={18} />}
          />

          {/* ✅ MODIFIED: Custom Mobile Input - NOT DISABLED, USER CAN CHANGE */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                maxLength={10}
                // ✅ REMOVED: disabled={!!preFilledMobile} - User can change now
                className={`
                  w-full py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                  pl-12 pr-10 
                  border-gray-300 focus:ring-blue-500 focus:border-transparent hover:border-gray-400
                  bg-white hover:shadow-md
                  ${errors.mobile ? 'border-red-500 bg-red-50' : ''}
                  placeholder-gray-500
                  text-gray-900
                  font-normal
                `}
                style={{ paddingLeft: '3.5rem', paddingRight: '2.5rem' }}
              />
            </div>
            {errors.mobile && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <span>⚠</span>
                {errors.mobile}
              </p>
            )}
          </div>

          <div className="relative">
            <AwesomeInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create your password (min. 6 characters)"
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

          <div className="relative">
            <AwesomeInput
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              required
              icon={<Lock size={18} />}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-20"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ top: 'calc(50% + 12px)' }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-start text-sm">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-green-600 focus:ring-green-500 transition duration-200 mt-1 cursor-pointer"
              required
            />
            <span className="ml-2 text-gray-600 cursor-text">
              I agree to the{' '}
              <button type="button" className="text-green-600 hover:text-green-500 font-medium transition-colors duration-200 cursor-pointer">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-green-600 hover:text-green-500 font-medium transition-colors duration-200 cursor-pointer">
                Privacy Policy
              </button>
            </span>
          </div>

          <AwesomeButton
            type="submit"
            variant="success"
            size="large"
            loading={loading}
            className="w-full"
            icon={<UserPlus size={18} />}
          >
            Register Now
          </AwesomeButton>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-500 font-medium transition-colors duration-200 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hover:from-green-500 hover:to-teal-500"
            >
              Sign in here!
            </button>
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">🎉 Get Started Today</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">Easy Signup</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">Secure Account</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">Quick Access</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwesomeSignup;