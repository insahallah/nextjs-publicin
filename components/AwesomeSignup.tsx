// components/AwesomeSignup.tsx
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, User, UserPlus, Store, MapPin, Building } from 'lucide-react';
import AwesomeInput from './AwesomeInput';
import AwesomeButton from './AwesomeButton';

interface SignupData {
  fullName: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessCategory: string;
  businessType: string;
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
  showBusinessFields?: boolean;
}

const AwesomeSignup: React.FC<AwesomeSignupProps> = ({
  onSignup,
  onSwitchToLogin,
  loading = false,
  className = '',
  showSocialSignup = false,
  showBusinessFields = true
}) => {
  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessCategory: '',
    businessType: 'individual',
    pinCode: '',
    city: '',
    village: '',
    block: '',
    state: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Business categories for dropdown
  const businessCategories = [
    'Beauty Parlour',
    'Doctor/Clinic',
    'Hospital',
    'Restaurant',
    'Hotel',
    'Electrician',
    'Plumber',
    'Carpenter',
    'Teacher/Tutor',
    'Driver',
    'Photographer',
    'Event Planner',
    'Gym/Fitness Center',
    'Spa/Salon',
    'Other Service'
  ];

  const businessTypes = [
    { value: 'individual', label: 'Individual Professional' },
    { value: 'shop', label: 'Shop/Store' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'service_center', label: 'Service Center' },
    { value: 'other', label: 'Other' }
  ];

  const validateStep1 = (): boolean => {
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

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (showBusinessFields) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }

      if (!formData.businessCategory) {
        newErrors.businessCategory = 'Business category is required';
      }

      if (!formData.businessType) {
        newErrors.businessType = 'Business type is required';
      }

      if (!formData.pinCode) {
        newErrors.pinCode = 'Pin code is required';
      }
      
      if (!formData.city) {
        newErrors.city = 'City is required';
      }
      
      if (!formData.village) {
        newErrors.village = 'Village/Locality is required';
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
    
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else {
      if (validateStep2()) {
        onSignup(formData);
      }
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

  const goToPreviousStep = () => {
    setCurrentStep(1);
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
            {currentStep === 1 ? 'Create Account' : 'Business Details'}
          </h2>
          <p className="text-gray-600">
            {currentStep === 1 
              ? 'Sign up to list your business and reach more customers' 
              : 'Tell us about your business'
            }
          </p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-4 mb-2">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 mx-2 ${
                currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 ? (
            /* Step 1: Personal Information */
            <>
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
                Continue to Business Details
              </AwesomeButton>
            </>
          ) : (
            /* Step 2: Business Information */
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <Store className="text-green-600 mr-2" size={20} />
                  <span className="text-green-800 font-medium">Business Information</span>
                </div>
                <p className="text-green-700 text-sm mt-1">This will help customers find your business</p>
              </div>

              <AwesomeInput
                label="Business Name"
                type="text"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                error={errors.businessName}
                required
                icon={<Store size={18} />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category *
                </label>
                <select
                  value={formData.businessCategory}
                  onChange={(e) => handleChange('businessCategory', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 ${
                    errors.businessCategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select your business category</option>
                  {businessCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.businessCategory && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessCategory}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleChange('businessType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 ${
                    errors.businessType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.businessType && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <MapPin className="text-blue-600 mr-2" size={20} />
                  <span className="text-blue-800 font-medium">Business Location</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">Where is your business located?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AwesomeInput
                  label="Pin Code"
                  type="text"
                  placeholder="Pin code"
                  value={formData.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  error={errors.pinCode}
                  required
                />
                <AwesomeInput
                  label="City"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  error={errors.city}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AwesomeInput
                  label="Village/Locality"
                  type="text"
                  placeholder="Village or locality"
                  value={formData.village}
                  onChange={(e) => handleChange('village', e.target.value)}
                  error={errors.village}
                  required
                />
                <AwesomeInput
                  label="Block"
                  type="text"
                  placeholder="Block (optional)"
                  value={formData.block}
                  onChange={(e) => handleChange('block', e.target.value)}
                  error={errors.block}
                />
              </div>

              <AwesomeInput
                label="State"
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                error={errors.state}
                required
                icon={<Building size={18} />}
              />

              <div className="flex gap-3">
                <AwesomeButton
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={goToPreviousStep}
                  className="flex-1"
                >
                  ← Back
                </AwesomeButton>
                
                <AwesomeButton
                  type="submit"
                  variant="success"
                  size="large"
                  loading={loading}
                  className="flex-1"
                  icon={<Store size={18} />}
                >
                  Create Business Account
                </AwesomeButton>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {currentStep === 1 ? 'Already have an account? ' : 'Back to personal details? '}
            <button
              type="button"
              onClick={currentStep === 1 ? onSwitchToLogin : goToPreviousStep}
              className="text-green-600 hover:text-green-500 font-medium transition-colors duration-200 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hover:from-green-500 hover:to-teal-500"
            >
              {currentStep === 1 ? 'Sign in here!' : 'Go back'}
            </button>
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">🎉 Start Your Business Journey</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">Free Listing</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">Local Customers</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">24/7 Visibility</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700">Easy Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwesomeSignup;