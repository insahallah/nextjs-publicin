// components/AwesomeSignup.tsx
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, User, UserPlus } from 'lucide-react';
import AwesomeInput from './AwesomeInput';
import AwesomeButton from './AwesomeButton';

interface SignupData {
  fullName: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  pinCode: string;
  city: string;
  village: string;
  block: string;
  state: string;
}

interface AwesomeSignupProps {
  onSignup: (data: SignupData) => void;
  onSwitchToLogin: () => void;
  loading?: boolean;
  className?: string;
  showSocialSignup?: boolean;
  showAdditionalFields?: boolean;
}

const AwesomeSignup: React.FC<AwesomeSignupProps> = ({
  onSignup,
  onSwitchToLogin,
  loading = false,
  className = '',
  showSocialSignup = false,
  showAdditionalFields = true
}) => {
  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    pinCode: '',
    city: '',
    village: '',
    block: '',
    state: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (showAdditionalFields) {
      if (!formData.pinCode) {
        newErrors.pinCode = 'Pin code is required';
      }
      if (!formData.city) {
        newErrors.city = 'City is required';
      }
      if (!formData.village) {
        newErrors.village = 'Village is required';
      }
      if (!formData.block) {
        newErrors.block = 'Block is required';
      }
      if (!formData.state) {
        newErrors.state = 'State is required';
      }
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
    <div className={`max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] ${className}`}>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Join Us!
          </h2>
          <p className="text-gray-600">Create your account and start your awesome journey</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field - Single Field Instead of First/Last Name */}
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

          {showAdditionalFields && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <AwesomeInput
                  label="Pin Code"
                  type="text"
                  placeholder="Enter pin code"
                  value={formData.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  error={errors.pinCode}
                  required
                />
                <AwesomeInput
                  label="City"
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  error={errors.city}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AwesomeInput
                  label="Village"
                  type="text"
                  placeholder="Enter village"
                  value={formData.village}
                  onChange={(e) => handleChange('village', e.target.value)}
                  error={errors.village}
                  required
                />
                <AwesomeInput
                  label="Block"
                  type="text"
                  placeholder="Enter block"
                  value={formData.block}
                  onChange={(e) => handleChange('block', e.target.value)}
                  error={errors.block}
                  required
                />
              </div>

              <AwesomeInput
                label="State"
                type="text"
                placeholder="Enter state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                error={errors.state}
                required
              />
            </>
          )}

          <div className="relative">
            <AwesomeInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              required
              icon={<Lock size={18} />}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 z-20 cursor-pointer bg-transparent border-none"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                top: 'calc(50% + 12px)',
                padding: '4px'
              }}
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 z-20 cursor-pointer bg-transparent border-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                top: 'calc(50% + 12px)',
                padding: '4px'
              }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-start text-sm">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition duration-200 mt-1 cursor-pointer"
              required
            />
            <span className="ml-2 text-gray-600 cursor-text">
              I agree to the{' '}
              <button type="button" className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200 cursor-pointer">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200 cursor-pointer">
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
            Create Account
          </AwesomeButton>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 cursor-text">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-500 font-medium transition-colors duration-200 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hover:from-green-500 hover:to-teal-500 cursor-pointer"
            >
              Sign in here!
            </button>
          </p>
        </div>
      </div>

      {/* Custom CSS for cursor and spacing */}
      <style jsx global>{`
        /* Force input styling to prevent overlap */
        .awesome-auth-modal input {
          padding-left: 3.5rem !important;
          padding-right: 2.5rem !important;
        }
        
        /* Icon positioning - Left side */
        .awesome-auth-modal .relative > div:first-child {
          left: 1rem !important;
          z-index: 10 !important;
        }
        
        /* Password toggle button - Right side */
        .awesome-auth-modal .relative > button {
          right: 1rem !important;
          z-index: 20 !important;
        }
        
        /* Ensure placeholder text doesn't overlap with icon */
        .awesome-auth-modal input::placeholder {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        
        /* Specific fix for password fields */
        .awesome-auth-modal .relative input[type="password"],
        .awesome-auth-modal .relative input[type="text"] {
          padding-right: 3rem !important;
        }
      `}</style>
    </div>
  );
};

export default AwesomeSignup;