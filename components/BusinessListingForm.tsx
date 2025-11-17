'use client';

import { useState } from 'react';

// Types
interface BusinessFormData {
  businessName: string;
  pincode: string;
  buildingNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  village: string;
  city: string;
  state: string;
}

const BusinessListingForm = () => {
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    pincode: '',
    buildingNumber: '',
    buildingName: '',
    street: '',
    landmark: '',
    village: '',
    city: '',
    state: ''
  });

  const [errors, setErrors] = useState<Partial<BusinessFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof BusinessFormData, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Pincode validation - only numbers and max 6 digits
    if (name === 'pincode') {
      if (value.length <= 6 && /^\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Real-time validation for touched fields
    if (touched[name as keyof BusinessFormData]) {
      validateField(name as keyof BusinessFormData, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof BusinessFormData, value);
  };

  const validateField = (name: keyof BusinessFormData, value: string) => {
    let error = '';

    switch (name) {
      case 'businessName':
        if (!value.trim()) error = 'Business name is required';
        else if (value.trim().length < 2) error = 'Business name must be at least 2 characters';
        break;
      
      case 'pincode':
        if (!value.trim()) error = 'Pincode is required';
        else if (!/^\d{6}$/.test(value)) error = 'Pincode must be exactly 6 digits';
        break;
      
      case 'buildingNumber':
        if (!value.trim()) error = 'Building number is required';
        break;
      
      case 'buildingName':
        if (!value.trim()) error = 'Building name is required';
        break;
      
      case 'street':
        if (!value.trim()) error = 'Street name is required';
        break;
      
      case 'landmark':
        if (!value.trim()) error = 'Landmark is required';
        break;
      
      case 'village':
        if (!value.trim()) error = 'Village is required';
        break;
      
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
      
      case 'state':
        if (!value.trim()) error = 'State is required';
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessFormData> = {};

    // Validate all fields
    (Object.keys(formData) as Array<keyof BusinessFormData>).forEach(key => {
      validateField(key, formData[key]);
    });

    // Check if any errors exist
    const hasErrors = Object.values(errors).some(error => error);
    return !hasErrors && Object.values(formData).every(value => value.trim() !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof BusinessFormData] = true;
      return acc;
    }, {} as Record<keyof BusinessFormData, boolean>);
    
    setTouched(allTouched);

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form data:', formData);
      alert('Business listing created successfully!');
      
      // Reset form
      setFormData({
        businessName: '',
        pincode: '',
        buildingNumber: '',
        buildingName: '',
        street: '',
        landmark: '',
        village: '',
        city: '',
        state: ''
      });
      setTouched({});
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error creating business listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading Component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <div className="text-2xl font-medium text-gray-900 mb-2">
        Creating Your Business Listing
      </div>
      <div className="text-gray-500">This may take a few seconds</div>
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Illustration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 flex items-center justify-center">
              <div className="max-w-md text-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4 sm:mb-6">
                  <svg 
                    viewBox="0 0 200 200" 
                    className="w-full h-full text-blue-500"
                    fill="currentColor"
                  >
                    <rect x="50" y="80" width="100" height="70" fill="currentColor" opacity="0.7"/>
                    <rect x="85" y="110" width="30" height="40" fill="white" opacity="0.9"/>
                    <rect x="60" y="90" width="20" height="20" fill="white" opacity="0.9"/>
                    <rect x="120" y="90" width="20" height="20" fill="white" opacity="0.9"/>
                    <polygon points="50,80 150,80 160,60 40,60" fill="currentColor" opacity="0.8"/>
                    <rect x="70" y="40" width="60" height="15" fill="white" opacity="0.9"/>
                    <text 
                      x="100" 
                      y="52" 
                      textAnchor="middle" 
                      fontSize="8" 
                      fill="currentColor" 
                      fontWeight="bold"
                    >
                      BUSINESS
                    </text>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                  List Your Business
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Reach more customers by listing your business on our platform. 
                  Fill in your details and get discovered today!
                </p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Enter your business details
                </h1>
                <p className="text-sm text-gray-600">
                  All fields marked with * are required
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Business Name */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.businessName ? 'true' : 'false'}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                      errors.businessName 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter your business name"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.businessName}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.pincode ? 'true' : 'false'}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                      errors.pincode 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter 6-digit pincode"
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.pincode}
                    </p>
                  )}
                </div>

                {/* Building Number */}
                <div>
                  <label htmlFor="buildingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Plot No. / Building No. *
                  </label>
                  <input
                    id="buildingNumber"
                    name="buildingNumber"
                    type="text"
                    required
                    value={formData.buildingNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.buildingNumber ? 'true' : 'false'}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                      errors.buildingNumber 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter building number/details"
                  />
                  {errors.buildingNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.buildingNumber}
                    </p>
                  )}
                </div>

                {/* Building Name */}
                <div>
                  <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 mb-2">
                    Building Name / Society *
                  </label>
                  <input
                    id="buildingName"
                    name="buildingName"
                    type="text"
                    required
                    value={formData.buildingName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.buildingName ? 'true' : 'false'}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                      errors.buildingName 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter building or society name"
                  />
                  {errors.buildingName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.buildingName}
                    </p>
                  )}
                </div>

                {/* Street and Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                      Street / Road *
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      required
                      value={formData.street}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={errors.street ? 'true' : 'false'}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                        errors.street 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter street name"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span>⚠</span>
                        {errors.street}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark *
                    </label>
                    <input
                      id="landmark"
                      name="landmark"
                      type="text"
                      required
                      value={formData.landmark}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={errors.landmark ? 'true' : 'false'}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                        errors.landmark 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter nearby landmark"
                    />
                    {errors.landmark && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span>⚠</span>
                        {errors.landmark}
                      </p>
                    )}
                  </div>
                </div>

                {/* Village */}
                <div>
                  <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-2">
                    Village *
                  </label>
                  <input
                    id="village"
                    name="village"
                    type="text"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.village ? 'true' : 'false'}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                      errors.village 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter village name"
                  />
                  {errors.village && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.village}
                    </p>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={errors.city ? 'true' : 'false'}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                        errors.city 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span>⚠</span>
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={errors.state ? 'true' : 'false'}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                        errors.state 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span>⚠</span>
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save and Continue'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessListingForm;