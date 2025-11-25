'use client';

import ContactDetailsForm from '@/components/ContactDetailsComponent';
import BusinessTimings from '@/components/BusinessTimingsComponent';
import ImageUpload from '@/components/ImageUploadComponent';
import { API_ENDPOINTS2 } from '@/configs/api';
import { generateBusinessDescription } from '@/lib/gemini-api';
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
  district: string;
  block: string;
  categories: string[];
  selectedCategoryIds: string[];
  selectedMainCategoryId: string | null;
  selectedSubCategoryId: string | null;
  selectedChildCategoryId: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  
  // Contact Details
  contactPersonName: string;
  contactEmail: string;
  alternateMobile: string;
  mobileNumbers?: string[];
  whatsappNumbers?: string[];
  emails?: string[];
  
  // Business Timings
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  
  // Images
  businessImages: File[];

  // NEW: AI Generated Description
  description: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
}

interface UserData {
  id: string;
  fullName: string;
  mobile: string;
  city: string;
  village: string;
}

interface ApiResponse {
  success: boolean;
  exists?: boolean;
  message?: string;
  user?: any;
}

// District and Block Interfaces
interface District {
  id: number;
  district_name: string;
  state_name: string;
  hi_name: string;
}

interface Block {
  id: number;
  block_name: string;
  district_id: number;
  hi_name: string;
}

// Category Interfaces
interface ChildCategory {
  id: string;
  label: string;
  emoji?: string;
}

interface SubCategory {
  id: string;
  label: string;
  emoji?: string;
  childcategories: ChildCategory[];
  hasChildren: boolean;
}

interface Category {
  id: string;
  label: string;
  emoji?: string;
  subcategories: SubCategory[];
  hasSubcategories: boolean;
}

// Custom Event Types
declare global {
  interface Window {
    dispatchEvent(event: CustomEvent): void;
  }
}

const BusinessListingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Login state management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [mobileCheckMessage, setMobileCheckMessage] = useState('');

  // Password state for login
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Category states
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedChildCategories, setSelectedChildCategories] = useState<ChildCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // District and Block states
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);

  // NEW STATE FOR AI DESCRIPTION
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string>('');

  // Initialize formData WITH description field
  const initialFormData: BusinessFormData = {
    businessName: '',
    pincode: '',
    buildingNumber: '',
    buildingName: '',
    street: '',
    landmark: '',
    village: '',
    city: '',
    state: '',
    district: '',
    block: '',
    categories: [],
    selectedCategoryIds: [],
    selectedMainCategoryId: null,
    selectedSubCategoryId: null,
    selectedChildCategoryId: null,
    latitude: null,
    longitude: null,
    address: '',
    contactPersonName: '',
    contactEmail: '',
    alternateMobile: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    },
    businessImages: [],
    description: '' // NEW: Description field
  };

  const [formData, setFormData] = useState<BusinessFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<BusinessFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof BusinessFormData, boolean>>>({});

  // Handler functions for new components
  const handleContactDetailsChange = (contactData: any) => {
    setFormData(prev => ({
      ...prev,
      contactPersonName: contactData.contactPersonName,
      contactEmail: contactData.contactEmail,
      alternateMobile: contactData.alternateMobile,
      mobileNumbers: contactData.mobileNumbers,
      whatsappNumbers: contactData.whatsappNumbers,
      emails: contactData.emails
    }));
    
    setCurrentStep(5);
  };

  const handleBusinessTimingsChange = (businessHours: BusinessFormData['businessHours']) => {
    setFormData(prev => ({
      ...prev,
      businessHours
    }));
  };

  const handleImageUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      businessImages: files
    }));
  };

  // NEW FUNCTION: GENERATE AI DESCRIPTION
  const generateAIDescription = async () => {
    if (!formData.businessName || !formData.categories.length || !formData.city) {
      alert('Please fill in business name, categories, and location first');
      return;
    }

    setIsGeneratingDescription(true);
    setDescriptionError('');

    try {
      const businessData = {
        businessName: formData.businessName,
        categories: formData.categories,
        location: `${formData.city}, ${formData.state}`,
        services: formData.categories
      };

      const aiDescription = await generateBusinessDescription(businessData);
      
      setFormData(prev => ({
        ...prev,
        description: aiDescription
      }));

    } catch (error) {
      console.error('Error generating AI description:', error);
      setDescriptionError('Failed to generate description. Using default description.');
      
      // Fallback description
      setFormData(prev => ({
        ...prev,
        description: `${formData.businessName} is a professional ${formData.categories[0]} located in ${formData.city}, ${formData.state}. We provide high-quality services and products to meet all your needs. Visit us for exceptional service!`
      }));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // AUTO-GENERATE DESCRIPTION WHEN CATEGORIES ARE SELECTED
  useEffect(() => {
    if (formData.categories.length > 0 && formData.businessName && formData.city && !formData.description) {
      // Auto-generate description after a short delay
      const timer = setTimeout(() => {
        generateAIDescription();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formData.categories, formData.businessName, formData.city]);

  // Fetch districts from API
  const fetchDistricts = async () => {
    setIsLoadingDistricts(true);
    try {
      const response = await fetch(`${API_ENDPOINTS2.AUTH.DISTRICT_LIST}?lang=en`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.data)) {
        setDistricts(result.data);
      } else if (Array.isArray(result.data)) {
        setDistricts(result.data);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  // Fetch blocks based on selected district
  const fetchBlocks = async (districtId: string) => {
    if (!districtId) return;
    
    setIsLoadingBlocks(true);
    try {
      const response = await fetch(`${API_ENDPOINTS2.AUTH.GET_BLOCK}?district_id=${districtId}&lang=en`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.data)) {
        setBlocks(result.data);
      } else if (Array.isArray(result.data)) {
        setBlocks(result.data);
      } else {
        setBlocks([]);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setBlocks([]);
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  // Fetch categories from API with proper error handling
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`${API_ENDPOINTS2.AUTH.MAIN_SEARCH}?lang=en`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        if (result.data && Array.isArray(result.data.categories)) {
          setCategories(result.data.categories);
        } else if (Array.isArray(result.data)) {
          setCategories(result.data);
        } else if (Array.isArray(result.categories)) {
          setCategories(result.categories);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
    fetchDistricts();

    const handleUserLoggedIn = (event: CustomEvent) => {
      const userData = (event as CustomEvent).detail.user;
      setIsLoggedIn(true);
      setUser(userData);

      if (userData?.mobile) {
        setMobileNumber(userData.mobile);
        setIsMobileVerified(true);
        setCurrentStep(2);
      }
    };

    const handleUserSignedUp = (event: CustomEvent) => {
      const userData = (event as CustomEvent).detail.user;
      setIsLoggedIn(true);
      setUser(userData);

      if (userData?.mobile) {
        setMobileNumber(userData.mobile);
        setIsMobileVerified(true);
        setCurrentStep(2);
      }
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
    window.addEventListener('userSignedUp', handleUserSignedUp as EventListener);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
      window.removeEventListener('userSignedUp', handleUserSignedUp as EventListener);
    };
  }, []);

  // Load categories when reaching step 3
  useEffect(() => {
    if (currentStep === 3) {
      fetchCategories();
    }
  }, [currentStep]);

  // Fetch blocks when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchBlocks(selectedDistrict);
      setSelectedBlock('');
    } else {
      setBlocks([]);
    }
  }, [selectedDistrict]);

  // Check if user is logged in
  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));

        const userObj = JSON.parse(userData);
        if (userObj.mobile) {
          setMobileNumber(userObj.mobile);
          setIsMobileVerified(true);
          setCurrentStep(2);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  const checkMobileNumberExists = async (mobile: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_ENDPOINTS2.AUTH.MOBILE_VALIDATION}?mobile=${mobile}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to check mobile number. Please try again.');
    }
  };

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      alert('Please enter your password');
      return;
    }

    setIsLoggingIn(true);

    try {
      const fd = new FormData();
      fd.append('mobile', mobileNumber);
      fd.append('password', password);

      const response = await fetch(`${API_ENDPOINTS2.AUTH.LOGIN}`, {
        method: 'POST',
        body: fd,
      });

      const result = await response.json();

      if (result.status === 'success') {
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('userData', JSON.stringify({
          id: result.id,
          fullName: result.name,
          mobile: result.mobile,
          city: result.city,
          village: result.village,
          email: result.email,
          state: result.state,
          profile_image: result.profile_image,
          pin: result.pin
        }));

        setIsLoggedIn(true);
        setUser({
          id: result.id,
          fullName: result.name,
          mobile: result.mobile,
          city: result.city,
          village: result.village
        });
        setIsMobileVerified(true);
        setCurrentStep(2);
        setMobileCheckMessage('✅ Login successful! Proceeding to next step...');
        setPassword('');
        setShowPasswordField(false);
      } else {
        const errorMessage = result.message || 'Login failed';
        alert(errorMessage);
        setMobileCheckMessage(`❌ ${errorMessage}`);
      }
    } catch (error) {
      alert('Login failed. Please try again.');
      setMobileCheckMessage('❌ Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Open signup modal
  const openSignupModal = () => {
    window.dispatchEvent(new CustomEvent('openSignupModalFromBusiness', {
      detail: { mobileNumber }
    }));
  };

  // Open login modal
  const openLoginModal = () => {
    window.dispatchEvent(new CustomEvent('openLoginModalFromBusiness', {
      detail: { mobileNumber }
    }));
  };

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

  // Mobile Number Verification with Password Login
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsCheckingAuth(true);
    setMobileCheckMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        const currentUser = JSON.parse(userData);

        if (currentUser.mobile === mobileNumber) {
          setIsLoggedIn(true);
          setUser(currentUser);
          setIsMobileVerified(true);
          setCurrentStep(2);
          setMobileCheckMessage('✅ Welcome back! Mobile number verified.');
          return;
        } else {
          setMobileCheckMessage('⚠️ Mobile number does not match your logged in account.');
          return;
        }
      }

      const apiResponse = await checkMobileNumberExists(mobileNumber);

      if (apiResponse.exists) {
        setShowPasswordField(true);
        setMobileCheckMessage('✅ Mobile number found. Please enter your password to login.');
      } else {
        setMobileCheckMessage('📝 New mobile number. Please sign up to continue.');

        setTimeout(() => {
          openSignupModal();
        }, 1000);
      }

    } catch (error) {
      setMobileCheckMessage('❌ Error verifying mobile number. Please try again.');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Category Selection Functions
  const handleMainCategorySelect = (category: Category) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
    setSelectedChildCategories([]);

    setFormData(prev => ({
      ...prev,
      categories: [category.label],
      selectedCategoryIds: [category.id],
      selectedMainCategoryId: category.id,
      selectedSubCategoryId: null,
      selectedChildCategoryId: null
    }));
  };

  const handleSubCategorySelect = (subCategory: SubCategory) => {
    if (subCategory.hasChildren && subCategory.childcategories.length > 0) {
      setSelectedSubCategory(subCategory);
      setSelectedChildCategories([]);
      setFormData(prev => ({
        ...prev,
        categories: [],
        selectedCategoryIds: [],
        selectedSubCategoryId: subCategory.id,
        selectedChildCategoryId: null
      }));
    } else {
      setSelectedSubCategory(subCategory);
      setSelectedChildCategories([]);
      setFormData(prev => ({
        ...prev,
        categories: [subCategory.label],
        selectedCategoryIds: [subCategory.id],
        selectedSubCategoryId: subCategory.id,
        selectedChildCategoryId: null,
        selectedMainCategoryId: null
      }));
    }
  };

  const handleChildCategorySelect = (childCategory: ChildCategory) => {
    setSelectedChildCategories([childCategory]);

    setFormData(prev => ({
      ...prev,
      categories: [childCategory.label],
      selectedCategoryIds: [childCategory.id],
      selectedChildCategoryId: childCategory.id,
      selectedMainCategoryId: null,
      selectedSubCategoryId: null
    }));
  };

  const handleBackToMainCategories = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSelectedChildCategories([]);
    setFormData(prev => ({
      ...prev,
      categories: [],
      selectedCategoryIds: [],
      selectedMainCategoryId: null,
      selectedSubCategoryId: null,
      selectedChildCategoryId: null
    }));
  };

  const handleBackToSubCategories = () => {
    setSelectedSubCategory(null);
    setSelectedChildCategories([]);
    setFormData(prev => ({
      ...prev,
      categories: [],
      selectedCategoryIds: [],
      selectedSubCategoryId: null,
      selectedChildCategoryId: null
    }));
  };

  // Business Details Validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'pincode') {
      if (value.length <= 6 && /^\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value } as BusinessFormData));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value } as BusinessFormData));
    }

    if (touched[name as keyof BusinessFormData]) {
      validateField(name as keyof BusinessFormData, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof BusinessFormData, value);
  };

  const validateField = (name: keyof BusinessFormData, value: string | number | string[] | null) => {
    let error = '';

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

      case 'district':
        if (!stringValue.trim()) error = 'District is required';
        break;

      case 'block':
        if (!stringValue.trim()) error = 'Block is required';
        break;

      case 'state':
        if (!stringValue.trim()) error = 'State is required';
        break;

      case 'description':
        if (!stringValue.trim()) error = 'Business description is required';
        else if (stringValue.trim().length < 50) error = 'Description should be at least 50 characters';
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
      'street', 'landmark', 'district', 'block', 'state', 'description'
    ];

    requiredFields.forEach(field => {
      const value = formData[field];
      const stringValue = typeof value === 'string' ? value :
        Array.isArray(value) ? '' :
          value === null ? '' : String(value);
      validateField(field, stringValue);
    });

    const hasErrors = Object.values(errors).some(error => !!error);
    const allFieldsFilled = requiredFields.every(field => {
      const value = formData[field];
      return typeof value === 'string' ? value.trim() !== '' : false;
    });

    return !hasErrors && allFieldsFilled;
  };

  // Step 2 form submission
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2() && location) {
      setCurrentStep(3);
    } else if (!location) {
      alert('Please allow location access to continue');
    } else {
      alert('Please fill all required fields correctly');
    }
  };

  // Handle district selection
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    
    const selectedDistrictObj = districts.find(d => d.id.toString() === districtId);
    if (selectedDistrictObj) {
      setFormData(prev => ({
        ...prev,
        district: districtId,
        city: selectedDistrictObj.district_name
      }));
    }
  };

  // Handle block selection
  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const blockId = e.target.value;
    setSelectedBlock(blockId);
    
    const selectedBlockObj = blocks.find(b => b.id.toString() === blockId);
    if (selectedBlockObj) {
      setFormData(prev => ({
        ...prev,
        block: blockId,
        village: selectedBlockObj.block_name
      }));
    }
  };

  // UPDATED Final API Submission - Includes description
  const handleFinalSubmit = async (e?: React.FormEvent | File[]) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }

    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : null;

    if (!user?.id) {
      alert('User not logged in. Please login to continue.');
      window.location.href = '/list-your-business';
      return;
    }

    const userId = user.id;

    if (formData.selectedCategoryIds.length === 0) {
      alert('Please select at least one category');
      return;
    }

    if (!location) {
      alert('Location access is required to complete registration.');
      return;
    }

    if (!formData.businessName || !formData.pincode || !formData.district || !formData.block || !formData.state || !formData.description) {
      alert('Please fill all required fields including description');
      return;
    }

    // COMPLETE DATA OBJECT WITH DESCRIPTION
    const completeBusinessData = {
      user_info: {
        userId: userId,
        mobile: mobileNumber,
        userName: user.fullName
      },
      business_details: {
        businessName: formData.businessName,
        building_number: formData.buildingNumber.toString(),
        building_name: formData.buildingName,
        street: formData.street,
        landmark: formData.landmark,
        village: formData.village || formData.block,
        city: formData.city || formData.district,
        state: formData.state,
        pinCode: formData.pincode,
        district: formData.district,
        block: formData.block,
        district_name: districts.find(d => d.id.toString() === formData.district)?.district_name || '',
        block_name: blocks.find(b => b.id.toString() === formData.block)?.block_name || '',
        description: formData.description // AI GENERATED DESCRIPTION
      },
      location_data: {
        latitude: formData.latitude?.toString() || '',
        longitude: formData.longitude?.toString() || '',
        address: formData.address
      },
      category_info: {
        categories: formData.categories,
        selectedCategoryIds: formData.selectedCategoryIds,
        selectedMainCategoryId: formData.selectedMainCategoryId,
        selectedSubCategoryId: formData.selectedSubCategoryId,
        selectedChildCategoryId: formData.selectedChildCategoryId,
        selectedMainCategory: selectedMainCategory?.label,
        selectedSubCategory: selectedSubCategory?.label,
        selectedChildCategories: selectedChildCategories.map(c => c.label),
        category: selectedMainCategory ? selectedMainCategory.id.replace('main', '') : null,
        subcategory: selectedSubCategory ? selectedSubCategory.id.replace('sub', '') : null,
        child: selectedChildCategories.length > 0 ? selectedChildCategories[0].id.replace('child', '') : null
      },
      contact_info: {
        contact_person_name: formData.contactPersonName,
        contact_email: formData.contactEmail,
        alternate_mobile: formData.alternateMobile,
        mobile_numbers: formData.mobileNumbers || [],
        whatsapp_numbers: formData.whatsappNumbers || [],
        emails: formData.emails || []
      },
      business_timing: formData.businessHours,
      business_images: {
        image_count: formData.businessImages.length,
        files: formData.businessImages.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }))
      }
    };

    console.log('🚀 === COMPLETE BUSINESS SUBMISSION DATA === 🚀');
    console.log('📋 FULL DATA IN JSON FORMAT:');
    console.log(JSON.stringify(completeBusinessData, null, 2));
    
    console.log('📊 DATA BREAKDOWN:');
    console.log('👤 User Info:', completeBusinessData.user_info);
    console.log('🏢 Business Details:', completeBusinessData.business_details);
    console.log('📍 Location Data:', completeBusinessData.location_data);
    console.log('📂 Category Info:', completeBusinessData.category_info);
    console.log('📞 Contact Info:', completeBusinessData.contact_info);
    console.log('⏰ Business Timing:', completeBusinessData.business_timing);
    console.log('🖼️ Business Images:', completeBusinessData.business_images);

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // User and basic info
      formDataToSend.append('userId', userId.toString());
      formDataToSend.append('mobile', mobileNumber);

      // BUSINESS DETAILS - INCLUDES DESCRIPTION
      formDataToSend.append('business_details', JSON.stringify(completeBusinessData.business_details));

      // CATEGORY INFO
      formDataToSend.append('category_info', JSON.stringify(completeBusinessData.category_info));

      // LOCATION DATA
      formDataToSend.append('location_data', JSON.stringify(completeBusinessData.location_data));

      // CONTACT INFO
      formDataToSend.append('contact_info', JSON.stringify(completeBusinessData.contact_info));

      // BUSINESS TIMING
      formDataToSend.append('business_timing', JSON.stringify(completeBusinessData.business_timing));

      // BUSINESS IMAGES
      if (formData.businessImages.length > 0) {
        formData.businessImages.forEach((file, index) => {
          formDataToSend.append(`business_images_${index}`, file);
        });
        formDataToSend.append('image_count', formData.businessImages.length.toString());
      } else {
        formDataToSend.append('use_default_image', 'true');
      }

      // Additional fields for backward compatibility
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('description', formData.description); // DESCRIPTION SEND KARENGE
      
      // Category selection for backward compatibility
      if (selectedChildCategories.length > 0) {
        const categoryId = selectedChildCategories[0].id.replace('child', '');
        formDataToSend.append('child', categoryId);
      } else if (selectedSubCategory) {
        const categoryId = selectedSubCategory.id.replace('sub', '');
        formDataToSend.append('subcategory', categoryId);
      } else if (selectedMainCategory) {
        const categoryId = selectedMainCategory.id.replace('main', '');
        formDataToSend.append('category', categoryId);
      }

      // Log FormData contents before sending
      console.log('📤 === FORM DATA TO SEND TO API ===');
      for (let [key, value] of formDataToSend.entries()) {
        if (key.startsWith('business_images_')) {
          console.log(`${key}:`, (value as File).name, '(File)');
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await fetch(API_ENDPOINTS2.AUTH.BUSINESS_SUBMISSION, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.message && result.message.includes('User not found')) {
        alert('User account not found. Please login again.');
        localStorage.removeItem('userData');
        window.location.href = '/list-your-business';
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        alert('Business listing created successfully with AI description!');
        window.location.href = '/my-businesses';

        // Reset form
        setCurrentStep(1);
        setMobileNumber('');
        setIsMobileVerified(false);
        setLocation(null);
        setSelectedMainCategory(null);
        setSelectedSubCategory(null);
        setSelectedChildCategories([]);
        setSelectedDistrict('');
        setSelectedBlock('');
        setFormData(initialFormData);
        setTouched({});
      } else {
        if (result.message && result.message.includes('User not found')) {
          alert('User account not found. Please login again.');
          localStorage.removeItem('userData');
          window.location.href = '/list-your-business';
          return;
        }
        throw new Error(result.message || 'Business listing creation failed');
      }

    } catch (error) {
      if (error instanceof Error && error.message.includes('User not found')) {
        alert('User account not found. Please login again.');
        localStorage.removeItem('userData');
        window.location.href = '/list-your-business';
        return;
      }

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
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentStep === 1 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
              >
                Mobile Verification
              </button>
              <button
                onClick={() => {
                  goToStep(2);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
              >
                Business Details
              </button>
              <button
                onClick={() => {
                  goToStep(3);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentStep === 3 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
              >
                Categories
              </button>
              <button
                onClick={() => {
                  goToStep(4);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentStep === 4 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
              >
                Contact Details
              </button>
              <button
                onClick={() => {
                  goToStep(5);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentStep === 5 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
              >
                Business Timings
              </button>
              <button
                onClick={() => {
                  goToStep(6);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentStep === 6 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
              >
                Upload Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40 hidden lg:block">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center py-4 sm:py-6">
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 w-full max-w-md sm:max-w-lg justify-between">
              <button
                onClick={() => goToStep(1)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${currentStep >= 1
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
                  }`}>
                  1
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Mobile</span>
              </button>

              <button
                onClick={() => goToStep(2)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${currentStep >= 2
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
                  }`}>
                  2
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Details</span>
              </button>

              <button
                onClick={() => goToStep(3)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${currentStep >= 3
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
                  }`}>
                  3
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Categories</span>
              </button>

              <button
                onClick={() => goToStep(4)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${currentStep >= 4
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
                  }`}>
                  4
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Contact</span>
              </button>

              <button
                onClick={() => goToStep(5)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${currentStep >= 5 ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${currentStep >= 5
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
                  }`}>
                  5
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Timings</span>
              </button>

              <button
                onClick={() => goToStep(6)}
                className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 text-center min-w-0 flex-1 ${currentStep >= 6 ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${currentStep >= 6
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
                  }`}>
                  6
                </div>
                <span className="font-medium text-xs sm:text-sm mt-1 sm:mt-0 truncate">Images</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
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

                    {/* NEW AI FEATURE */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">AI</span>
                      </div>
                      <span className="text-gray-700">AI-Powered Business Description Generation</span>
                    </div>
                  </div>

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
                        {showPasswordField ? 'Enter Your Password' : 'Enter Your Mobile Number'}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {showPasswordField
                          ? 'Please enter your password to continue'
                          : isLoggedIn
                            ? 'You are already logged in. Click "Continue" to proceed.'
                            : 'We\'ll check if your mobile number is registered'
                        }
                      </p>

                      {isLoggedIn && user && !showPasswordField && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                          <p className="text-green-800 text-sm">
                            ✅ Welcome back, <strong>{user.fullName}</strong>!
                            Your mobile number is pre-filled. Click "Continue" to proceed.
                          </p>
                        </div>
                      )}
                    </div>

                    {!showPasswordField ? (
                      <form onSubmit={handleMobileSubmit}>
                        <div className="relative mb-4">
                          <span className="color111 fw500 entermobilenumber_countrycode absolute left-0 top-0 bottom-0 flex items-center gap-2 z-10 bg-gray-50 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
                            <span className="entermobilenumber_flag iconwrap w-6 h-4 relative flex items-center justify-center overflow-hidden">
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
                                setMobileCheckMessage('');
                              }}
                              disabled={isLoggedIn}
                            />
                            <label
                              htmlFor="mobileInput"
                              className={`absolute left-24 transition-all duration-200 pointer-events-none ${mobileNumber
                                ? 'top-1 text-xs text-blue-600 bg-white px-1 -translate-y-2'
                                : 'top-1/2 text-gray-400 -translate-y-1/2'
                                }`}
                            >
                              Enter Mobile No.
                            </label>
                          </div>
                        </div>

                        {mobileCheckMessage && (
                          <div className={`mb-4 p-3 rounded-lg text-sm ${mobileCheckMessage.includes('✅')
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : mobileCheckMessage.includes('❌')
                              ? 'bg-red-50 border border-red-200 text-red-800'
                              : 'bg-blue-50 border border-blue-200 text-blue-800'
                            }`}>
                            {mobileCheckMessage}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isCheckingAuth || mobileNumber.length !== 10}
                          className="primarybutton w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                          {isCheckingAuth ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Checking Mobile...
                            </>
                          ) : isLoggedIn ? (
                            'Continue to Business Details'
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
                    ) : (
                      <form onSubmit={handleLogin}>
                        <div className="mb-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-blue-800 text-sm">
                              Logging in with: <strong>+91 {mobileNumber}</strong>
                            </p>
                          </div>

                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                            placeholder="Enter your password"
                          />
                        </div>

                        {mobileCheckMessage && (
                          <div className={`mb-4 p-3 rounded-lg text-sm ${mobileCheckMessage.includes('✅')
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-blue-50 border border-blue-200 text-blue-800'
                            }`}>
                            {mobileCheckMessage}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordField(false);
                              setPassword('');
                              setMobileCheckMessage('');
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isLoggingIn || !password.trim()}
                            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isLoggingIn ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Logging in...
                              </>
                            ) : (
                              'Login'
                            )}
                          </button>
                        </div>

                        <div className="mt-4 text-center">
                          <button
                            type="button"
                            onClick={openSignupModal}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Don't have an account? Sign up
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Step 2: Business Details - UPDATED WITH AI DESCRIPTION */}
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

                    <div className={`mb-4 p-3 rounded-lg ${location ? 'bg-green-50 border border-green-200' :
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
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${errors.businessName
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
                          required
                          value={formData.pincode}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={errors.pincode ? 'true' : 'false'}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${errors.pincode
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                        />
                        {errors.pincode && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span>⚠</span>
                            {errors.pincode}
                          </p>
                        )}
                      </div>

                      {/* District Selection */}
                      <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                          District *
                        </label>
                        <select
                          id="district"
                          name="district"
                          required
                          value={selectedDistrict}
                          onChange={handleDistrictChange}
                          onBlur={handleBlur}
                          aria-invalid={errors.district ? 'true' : 'false'}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.district
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <option value="">Select District</option>
                          {isLoadingDistricts ? (
                            <option value="" disabled>Loading districts...</option>
                          ) : (
                            districts.map((district) => (
                              <option key={district.id} value={district.id}>
                                {district.district_name}
                              </option>
                            ))
                          )}
                        </select>
                        {errors.district && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span>⚠</span>
                            {errors.district}
                          </p>
                        )}
                      </div>

                      {/* Block Selection */}
                      <div>
                        <label htmlFor="block" className="block text-sm font-medium text-gray-700 mb-2">
                          Block *
                        </label>
                        <select
                          id="block"
                          name="block"
                          required
                          value={selectedBlock}
                          onChange={handleBlockChange}
                          onBlur={handleBlur}
                          disabled={!selectedDistrict || isLoadingBlocks}
                          aria-invalid={errors.block ? 'true' : 'false'}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.block
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                            } ${!selectedDistrict ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                          <option value="">{!selectedDistrict ? 'Select District First' : 'Select Block'}</option>
                          {isLoadingBlocks ? (
                            <option value="" disabled>Loading blocks...</option>
                          ) : (
                            blocks.map((block) => (
                              <option key={block.id} value={block.id}>
                                {block.block_name}
                              </option>
                            ))
                          )}
                        </select>
                        {errors.block && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span>⚠</span>
                            {errors.block}
                          </p>
                        )}
                      </div>

                      {/* Building Number */}
                      <div>
                        <label htmlFor="buildingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Building Number *
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
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${errors.buildingNumber
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          placeholder="Enter building/house number"
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
                          Building Name *
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
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${errors.buildingName
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          placeholder="Enter building name"
                        />
                        {errors.buildingName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span>⚠</span>
                            {errors.buildingName}
                          </p>
                        )}
                      </div>

                      {/* Street */}
                      <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                          Street/Road *
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
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${errors.street
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

                      {/* Landmark */}
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
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${errors.landmark
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

                      {/* State */}
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
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 ${errors.state
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

                      {/* AI DESCRIPTION SECTION - NEW */}
                      <div className="border-t pt-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Business Description *
                          </label>
                          <button
                            type="button"
                            onClick={generateAIDescription}
                            disabled={isGeneratingDescription || !formData.businessName || !formData.categories.length}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                          >
                            {isGeneratingDescription ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <span>✨</span>
                                AI Generate
                              </>
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            aria-invalid={errors.description ? 'true' : 'false'}
                            placeholder="Business description will be automatically generated based on your business details. You can also edit it manually."
                            rows={5}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 resize-none ${errors.description
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 hover:border-gray-400'
                              }`}
                          />
                          
                          {isGeneratingDescription && (
                            <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
                              <div className="flex items-center gap-2 text-purple-600">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <span>AI is generating your description...</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span>⚠</span>
                            {errors.description}
                          </p>
                        )}
                        
                        {descriptionError && (
                          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-orange-700 text-sm">{descriptionError}</p>
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                          <span>💡</span>
                          <p>
                            AI-powered description helps customers understand your business better. 
                            It's automatically generated based on your business name, categories, and location.
                            You can edit the generated description as needed.
                          </p>
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
                          {location ? 'Save to Continue' : 'Allow Location to Continue'}
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
                        {!selectedMainCategory
                          ? 'Choose a main category to get started'
                          : !selectedSubCategory
                            ? 'Now select a sub-category'
                            : 'Select specific child categories for your business'
                        }
                      </p>
                    </div>

                    {isLoadingCategories ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-lg text-gray-600">Loading categories...</div>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-red-500 text-lg mb-4">❌ No categories available</div>
                        <button
                          onClick={fetchCategories}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Retry Loading Categories
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Breadcrumb Navigation */}
                        {(selectedMainCategory || selectedSubCategory) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <button
                              onClick={handleBackToMainCategories}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              All Categories
                            </button>
                            {selectedMainCategory && (
                              <>
                                <span>›</span>
                                {selectedSubCategory ? (
                                  <button
                                    onClick={handleBackToSubCategories}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    {selectedMainCategory.label}
                                  </button>
                                ) : (
                                  <span className="text-gray-900 font-medium">{selectedMainCategory.label}</span>
                                )}
                              </>
                            )}
                            {selectedSubCategory && (
                              <>
                                <span>›</span>
                                <span className="text-gray-900 font-medium">{selectedSubCategory.label}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Main Categories View */}
                        {!selectedMainCategory && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                            {categories.map((category) => (
                              <div
                                key={category.id}
                                onClick={() => handleMainCategorySelect(category)}
                                className="p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 border-gray-200 bg-white text-gray-700"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {category.emoji && (
                                      <span className="text-xl">{category.emoji}</span>
                                    )}
                                    <span className="font-medium text-sm sm:text-base">{category.label}</span>
                                  </div>
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                {category.hasSubcategories && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    {category.subcategories.length} sub-categories available
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Sub Categories View */}
                        {selectedMainCategory && !selectedSubCategory && (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {selectedMainCategory.subcategories.map((subCategory) => {
                              const isSelected = formData.selectedCategoryIds.includes(subCategory.id);

                              return (
                                <div
                                  key={subCategory.id}
                                  onClick={() => handleSubCategorySelect(subCategory)}
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'hover:border-blue-300 hover:bg-blue-50 border-gray-200 bg-white text-gray-700'
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {subCategory.emoji && (
                                        <span className="text-xl">{subCategory.emoji}</span>
                                      )}
                                      <span className="font-medium text-sm sm:text-base">{subCategory.label}</span>
                                      {!subCategory.hasChildren || subCategory.childcategories.length === 0 ? (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                          Direct Select
                                        </span>
                                      ) : (
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                          Has Child Categories
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isSelected && (
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {subCategory.hasChildren && subCategory.childcategories.length > 0 && (
                                        <span className="text-xs text-gray-500">
                                          {subCategory.childcategories.length} options
                                        </span>
                                      )}
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </div>

                                  {isSelected && (
                                    <div className="mt-2 text-xs text-green-600 font-medium">
                                      ✓ Selected
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Child Categories View */}
                        {selectedSubCategory && selectedSubCategory.hasChildren && selectedSubCategory.childcategories.length > 0 && (
                          <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  onClick={handleBackToSubCategories}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                  Back
                                </button>
                                <span className="text-gray-400">›</span>
                                <span className="text-blue-900 font-semibold">{selectedMainCategory?.label}</span>
                              </div>
                              <h3 className="font-semibold text-blue-900 text-lg">
                                {selectedSubCategory.label}
                              </h3>
                              <p className="text-sm text-blue-700 mt-1">
                                Select one category that best matches your business
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                              {selectedSubCategory.childcategories.map((childCategory) => {
                                const isSelected = selectedChildCategories.some(child => child.id === childCategory.id);

                                return (
                                  <div
                                    key={childCategory.id}
                                    onClick={() => handleChildCategorySelect(childCategory)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {childCategory.emoji && (
                                          <span className="text-xl">{childCategory.emoji}</span>
                                        )}
                                        <span className="font-medium text-sm sm:text-base">{childCategory.label}</span>
                                      </div>
                                      {isSelected ? (
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {selectedChildCategories.length > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 mb-2">
                                  Selected Category
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedChildCategories.map((child) => (
                                    <span
                                      key={child.id}
                                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                      {child.emoji && <span className="mr-1">{child.emoji}</span>}
                                      {child.label}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-green-700 text-sm mt-2">
                                  ✓ Category selected successfully! You can now complete your business listing.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedSubCategory && (!selectedSubCategory.hasChildren || selectedSubCategory.childcategories.length === 0) && (
                          <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h3 className="font-semibold text-green-800 mb-2">
                                ✅ Category Selected Successfully!
                              </h3>
                              <p className="text-green-700">
                                You have selected: <strong>{selectedSubCategory.label}</strong>
                              </p>
                              <div className="mt-2 bg-white border border-green-300 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  {selectedSubCategory.emoji && (
                                    <span className="text-xl">{selectedSubCategory.emoji}</span>
                                  )}
                                  <span className="font-medium text-green-800">{selectedSubCategory.label}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                              <button
                                type="button"
                                onClick={handleBackToSubCategories}
                                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                              >
                                Change Category
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurrentStep(4)}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                              >
                                Continue to Contact Details
                              </button>
                            </div>
                          </div>
                        )}

                        {formData.selectedCategoryIds.length > 0 && (
                          <div className="border-t pt-6 mt-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                              <h3 className="font-semibold text-green-800 mb-2">
                                ✅ Categories Selected Successfully!
                              </h3>
                              <p className="text-green-700">
                                You have selected {formData.categories.length} category for your business.
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {formData.categories.map((category, index) => (
                                  <span
                                    key={index}
                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMainCategory(null);
                                  setSelectedSubCategory(null);
                                  setSelectedChildCategories([]);
                                  setFormData(prev => ({
                                    ...prev,
                                    categories: [],
                                    selectedCategoryIds: [],
                                    selectedMainCategoryId: null,
                                    selectedSubCategoryId: null,
                                    selectedChildCategoryId: null
                                  }));
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                              >
                                Change Categories
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurrentStep(4)}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                              >
                                Continue to Contact Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Contact Details */}
                {currentStep === 4 && (
                  <div>
                    <ContactDetailsForm
                      mobileNumber={mobileNumber}
                      onContactSubmit={handleContactDetailsChange}
                      onBack={() => setCurrentStep(3)}
                    />
                  </div>
                )}

                {/* Step 5: Business Timings */}
                {currentStep === 5 && (
                  <div>
                    <BusinessTimings
                      onTimingsSubmit={(timingsData) => {
                        handleBusinessTimingsChange(timingsData);
                        setCurrentStep(6);
                      }}
                      onBack={() => setCurrentStep(4)}
                    />
                  </div>
                )}

                {/* Step 6: Image Upload */}
                {currentStep === 6 && (
                  <div>
                    <ImageUpload
                      onImageUpload={handleImageUpload}
                      onBack={() => setCurrentStep(5)}
                      onSubmit={handleFinalSubmit}
                      maxImages={10}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Simple Steps Section */}
      <div id="businessliststepid" className="section bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Get a FREE Business Listing in 6 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-12">
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
                  Add name, address, district, block + AI Description
                </p>
              </div>
            </div>

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

            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-yellow-500 text-yellow-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                    4
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">Contact Details</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Add contact person and communication details
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-red-500 text-red-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                    5
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">Business Timings</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Set your opening and closing hours
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-indigo-500 text-indigo-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                    6
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Upload Images</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Add photos of your business
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