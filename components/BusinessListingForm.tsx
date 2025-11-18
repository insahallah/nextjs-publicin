'use client';

import { useState, useEffect } from 'react';

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
  categories: string[];
  password: string;
  confirmPassword: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
}

const BusinessListingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    pincode: '',
    buildingNumber: '',
    buildingName: '',
    street: '',
    landmark: '',
    village: '',
    city: '',
    state: '',
    categories: [],
    password: '',
    confirmPassword: '',
    latitude: null,
    longitude: null,
    address: ''
  });

  const [errors, setErrors] = useState<Partial<BusinessFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof BusinessFormData, boolean>>>({});

  // Available categories
  const availableCategories = [
    'Restaurant & Food',
    'Retail Shop',
    'Healthcare',
    'Education',
    'Automotive',
    'Home Services',
    'Beauty & Spa',
    'Professional Services',
    'Real Estate',
    'Travel & Tourism',
    'Technology',
    'Entertainment'
  ];

  // Automatically get location when user moves to step 2
  useEffect(() => {
    if (currentStep === 2 && isMobileVerified) {
      getCurrentLocation();
    }
  }, [currentStep, isMobileVerified]);

  // Get user location automatically
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported in this browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setIsGettingLocation(false);
        setLocationPermission('granted');
        
        // Update form data with coordinates
        setFormData(prev => ({
          ...prev,
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          address: `Location: ${newLocation.latitude.toFixed(6)}, ${newLocation.longitude.toFixed(6)}`
        }));
      },
      (err) => {
        setLocationError(err.message);
        setIsGettingLocation(false);
        setLocationPermission('denied');
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location access denied. Please allow location access to continue.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Step 1: Mobile Number Verification
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('OTP sent to:', mobileNumber);
      
      // For demo, auto-verify after OTP send
      setIsMobileVerified(true);
      setCurrentStep(2);
      alert('OTP sent to your mobile number! Moving to business details...');
      
    } catch (error) {
      alert('Error sending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Business Details Validation
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

  const validateField = (name: keyof BusinessFormData, value: string | number | string[] | null) => {
    let error = '';

    // Convert value to string for validation
    const stringValue = typeof value === 'string' ? value : 
                       Array.isArray(value) ? '' : 
                       value === null ? '' : String(value);

    switch (name) {
      case 'businessName':
        if (!stringValue.trim()) error = 'Business name is required';
        else if (stringValue.trim().length < 2) error = 'Business name must be at least 2 characters';
        break;
      
      case 'pincode':
        if (!stringValue.trim()) error = 'Pincode is required';
        else if (!/^\d{6}$/.test(stringValue)) error = 'Pincode must be exactly 6 digits';
        break;
      
      case 'buildingNumber':
        if (!stringValue.trim()) error = 'Building number is required';
        break;
      
      case 'buildingName':
        if (!stringValue.trim()) error = 'Building name is required';
        break;
      
      case 'street':
        if (!stringValue.trim()) error = 'Street name is required';
        break;
      
      case 'landmark':
        if (!stringValue.trim()) error = 'Landmark is required';
        break;
      
      case 'village':
        if (!stringValue.trim()) error = 'Village is required';
        break;
      
      case 'city':
        if (!stringValue.trim()) error = 'City is required';
        break;
      
      case 'state':
        if (!stringValue.trim()) error = 'State is required';
        break;
      
      case 'password':
        if (!stringValue.trim()) error = 'Password is required';
        else if (stringValue.length < 6) error = 'Password must be at least 6 characters';
        break;
      
      case 'confirmPassword':
        if (!stringValue.trim()) error = 'Please confirm your password';
        else if (stringValue !== formData.password) error = 'Passwords do not match';
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateStep2 = (): boolean => {
    const requiredFields: (keyof BusinessFormData)[] = [
      'businessName', 'pincode', 'buildingNumber', 'buildingName', 
      'street', 'landmark', 'village', 'city', 'state',
      'password', 'confirmPassword'
    ];

    // Validate all required fields
    requiredFields.forEach(field => {
      const value = formData[field];
      // Convert to string for validation - handle null and array cases
      const stringValue = typeof value === 'string' ? value : 
                         Array.isArray(value) ? '' : 
                         value === null ? '' : String(value);
      validateField(field, stringValue);
    });

    // Check if any errors exist and all fields are filled
    const hasErrors = Object.values(errors).some(error => error);
    const allFieldsFilled = requiredFields.every(field => {
      const value = formData[field];
      return typeof value === 'string' ? value.trim() !== '' : false;
    });

    return !hasErrors && allFieldsFilled;
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if location is available
    if (!location) {
      alert('Location access is required to register your business. Please allow location access and try again.');
      return;
    }

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof BusinessFormData] = true;
      return acc;
    }, {} as Record<keyof BusinessFormData, boolean>);
    
    setTouched(allTouched);

    if (!validateStep2()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Move to step 3
    setCurrentStep(3);
  };

  // Step 3: Category Selection
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const isSelected = prev.categories.includes(category);
      if (isSelected) {
        return {
          ...prev,
          categories: prev.categories.filter(cat => cat !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  // Final API Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    // Final location check
    if (!location) {
      alert('Location access is required to complete registration.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare final data for API
      const finalData = {
        mobileNumber: mobileNumber,
        businessInfo: {
          name: formData.businessName,
          address: {
            buildingNumber: formData.buildingNumber,
            buildingName: formData.buildingName,
            street: formData.street,
            landmark: formData.landmark,
            village: formData.village,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            latitude: formData.latitude,
            longitude: formData.longitude,
            fullAddress: formData.address
          },
          categories: formData.categories,
          location: {
            latitude: formData.latitude,
            longitude: formData.longitude,
            address: formData.address
          }
        },
        account: {
          password: formData.password,
          mobileVerified: true
        },
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      console.log('Final data for API:', finalData);

      // Actual API call - replace with your endpoint
      const response = await fetch('/api/business-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API call failed');
      }

      alert('Business listing created successfully!');
      
      // Reset form and go back to step 1
      setCurrentStep(1);
      setMobileNumber('');
      setIsMobileVerified(false);
      setLocation(null);
      setFormData({
        businessName: '',
        pincode: '',
        buildingNumber: '',
        buildingName: '',
        street: '',
        landmark: '',
        village: '',
        city: '',
        state: '',
        categories: [],
        password: '',
        confirmPassword: '',
        latitude: null,
        longitude: null,
        address: ''
      });
      setTouched({});
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error instanceof Error ? error.message : 'Error creating business listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation between steps
  const goToStep = (step: number) => {
    if (step === 2 && !isMobileVerified) {
      alert('Please verify your mobile number first');
      return;
    }
    if (step === 3 && !validateStep2()) {
      alert('Please complete all business details first');
      return;
    }
    setCurrentStep(step);
  };

  // Loading Component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <div className="text-2xl font-medium text-gray-900 mb-2">
        {currentStep === 1 ? 'Sending OTP...' : 
         currentStep === 2 ? 'Validating Details...' : 
         'Creating Your Listing...'}
      </div>
      <div className="text-gray-500">This may take a few seconds</div>
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
{/* Responsive Mobile Menu Button (Only One Button) */}




      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-xl p-4 min-w-48 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <button
                onClick={() => {
                  goToStep(1);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 1 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Mobile Verification
              </button>
              <button
                onClick={() => {
                  goToStep(2);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Business Details
              </button>
              <button
                onClick={() => {
                  goToStep(3);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 3 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps - Fixed Navigation Bar - Large screens pe visible */}
      <div className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40 hidden lg:block">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center py-4 sm:py-6">
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 w-full max-w-md sm:max-w-lg justify-between">
              {/* Step 1 */}
              <button 
                onClick={() => goToStep(1)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${
                  currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  currentStep >= 1 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  1
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Mobile Verification</span>
              </button>

              {/* Step 2 */}
              <button 
                onClick={() => goToStep(2)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${
                  currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  currentStep >= 2 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  2
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Business Details</span>
              </button>

              {/* Step 3 */}
              <button 
                onClick={() => goToStep(3)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${
                  currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  currentStep >= 3 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  3
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Categories</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section - Added padding top for fixed nav */}
      <div className="pt-20 sm:pt-24 py-4 sm:py-8 lg:pt-24">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Static Content */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 flex items-center justify-center">
                <div className="max-w-md w-full">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    List Your Business for <span className="text-blue-600">FREE</span>
                  </h1>
                  
                  <p className="text-lg text-gray-700 mb-6">
                    with India's No. 1 Local Search Engine
                  </p>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Get Discovered & Create Your Online Business</span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Respond to Customer Reviews & Questions</span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Showcase Your Product & Service Offerings</span>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="text-xs text-gray-600 text-center border-t border-gray-200 pt-4">
                    <p>
                      By continuing, you agree to our{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
                      ,{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy</a>
                      {' '}&{' '}
                      <a href="#" className="text-blue-600 hover:underline">Infringement Policy</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Dynamic Form Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Step 1: Mobile Verification */}
                {currentStep === 1 && (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                        Enter Your Mobile Number
                      </h1>
                      <p className="text-sm text-gray-600">
                        We'll send you an OTP to verify your number
                      </p>
                    </div>

                    <form className="entermobilenumber_form entermobilenumber_inactive" onSubmit={handleMobileSubmit}>
                      <div className="relative mb-4">
                        {/* Country Code with Flag */}
                        <span className="color111 fw500 entermobilenumber_countrycode absolute left-0 top-0 bottom-0 flex items-center gap-2 z-10 bg-gray-50 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
                          <span 
                            role="presentation" 
                            className="entermobilenumber_flag iconwrap w-6 h-4 relative flex items-center justify-center overflow-hidden"
                          >
                            {/* Proper Indian Flag */}
                            <div className="absolute inset-0 flex flex-col">
                              <div className="h-1/3 bg-orange-500"></div>
                              <div className="h-1/3 bg-white flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              </div>
                              <div className="h-1/3 bg-green-500"></div>
                            </div>
                          </span>
                          <span className="text-gray-700 font-medium text-sm">+91</span>
                        </span>

                        {/* Mobile Input with Floating Label */}
                        <div className="relative">
                          <input
                            aria-label="Enter Mobile Number"
                            aria-required="true"
                            className="entermobilenumber_input input fw500 pl-24 pr-4 py-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors text-gray-900 bg-white"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="mobileNumber"
                            autoComplete="off"
                            maxLength={10}
                            required
                            id="mobileInput"
                            value={mobileNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setMobileNumber(value);
                            }}
                          />
                          {/* Floating Label */}
                          <label 
                            htmlFor="mobileInput"
                            className={`absolute left-24 transition-all duration-200 pointer-events-none ${
                              mobileNumber 
                                ? 'top-1 text-xs text-blue-600 bg-white px-1 -translate-y-2' 
                                : 'top-1/2 text-gray-400 -translate-y-1/2'
                            }`}
                          >
                            Enter Mobile No.
                          </label>
                        </div>
                      </div>

                      {/* Start Now Button */}
                      <button
                        aria-label="Start Now"
                        tabIndex={0}
                        role="button"
                        className="primarybutton w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        type="submit"
                        disabled={isLoading || mobileNumber.length !== 10}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            Start Now
                            <span className="businesslistfree_whitearrow iconwrap moveRight transition-transform duration-300 group-hover:translate-x-1">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Step 2: Business Details */}
                {currentStep === 2 && (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                        Enter your business details
                      </h1>
                      <p className="text-sm text-gray-600">
                        All fields marked with * are required
                      </p>
                      <p className="text-sm text-blue-600 font-medium mt-2">
                        📍 Location access is required to register your business
                      </p>
                    </div>

                    {/* Location Detection Status - Hidden from users */}
                    <div className={`mb-4 p-3 rounded-lg ${
                      location ? 'bg-green-50 border border-green-200' : 
                      locationError ? 'bg-red-50 border border-red-200' : 
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        {isGettingLocation ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 text-sm">Detecting your location...</span>
                          </>
                        ) : location ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-700 text-sm">Location detected successfully</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-red-700 text-sm">{locationError}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleStep2Submit} className="space-y-4 sm:space-y-6">
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

                      {/* Password Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-invalid={errors.password ? 'true' : 'false'}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                              errors.password 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Enter password"
                          />
                          {errors.password && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <span>⚠</span>
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${
                              errors.confirmPassword 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Confirm password"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <span>⚠</span>
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={!location}
                          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {location ? 'Continue to Categories' : 'Allow Location to Continue'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 3: Category Selection */}
                {currentStep === 3 && (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                        Select Business Categories
                      </h1>
                      <p className="text-sm text-gray-600">
                        Choose relevant categories for your business (select at least one)
                      </p>
                    </div>

                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableCategories.map((category) => (
                          <div
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.categories.includes(category)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm sm:text-base">{category}</span>
                              {formData.categories.includes(category) && (
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {formData.categories.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800 font-medium">
                            Selected categories: {formData.categories.join(', ')}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={formData.categories.length === 0 || isLoading}
                          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Creating Listing...' : 'Complete Listing'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Simple Steps Section */}
      <div id="businessliststepid" className="section bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Get a FREE Business Listing in 3 Simple Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-blue-500 text-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                    1
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Mobile Verification</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Enter your mobile number to get started
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-green-500 text-green-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                    2
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Business Details</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Add name, address, and allow location access
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-purple-500 text-purple-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                    3
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Select Categories</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Choose relevant categories for your business
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessListingForm;