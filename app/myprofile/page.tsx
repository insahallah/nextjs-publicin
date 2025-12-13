// app/myprofile/page.tsx - FIXED VERSION
'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, CheckCircle, AlertCircle, MapPin, Home, Building, Plus, User, LogOut, Shield, Mail, Phone, Calendar, Users, Lock, X, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';
import { API_ENDPOINTS2 } from '@/configs/api';
import { IMAGES_URL } from '@/configs/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Import the components
import PersonalDetails, { PersonalDetailsHandle } from './PersonalDetails';
import AddressDetails, { AddressDetailsHandle } from './AddressDetails';
import FamilyFriends, { FamilyFriendsHandle } from './FamilyFriends';

// TypeScript Interfaces
interface UserType {
    id: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    profileImage?: string;
    profile_image?: string;
    fullname?: string;
    dob?: string;
    date_of_birth?: string;
    gender?: string;
    occupation?: string;
    maritalStatus?: string;
    marital_status?: string;
    home_address?: {
        id: number;
        user_id: number;
        full_name: string;
        address_line: string;
        area: string;
        landmark: string;
        contact_mobile: string;
        city: string;
        state: string;
        district: string;
        pincode: string;
        landline_std: string;
        landline_number: string;
        email: string;
        address_tag: string;
        is_active: number;
        is_primary: number;
        created_at: string;
        updated_at: string;
    };
    family_friends?: Array<any>;
}

interface PersonalDetailsType {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    occupation: string;
    maritalStatus: string;
}

// FIXED: Changed is_primary to number to match AddressDetails component
interface HomeAddress {
    id?: number;
    full_name: string;
    address_line: string;
    area: string;
    landmark: string;
    contact_mobile: string;
    city: string;
    state: string;
    district: string;
    pincode: string;
    landline_std: string;
    landline_number: string;
    email: string;
    address_tag: string;
    is_primary?: number; // Changed from boolean to number
    is_active?: number;
    user_id?: number;
    created_at?: string;
    updated_at?: string;
}

interface FamilyFriend {
    id: number;
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
}

interface CompletedSections {
    PersonalDetails: boolean;
    Addresses: boolean;
    FamilyFriends: boolean;
    Completed: boolean;
}

// Loading Component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <Shield className="absolute inset-0 m-auto text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Verifying Authentication</h2>
            <p className="text-gray-600 mt-2">Please wait while we secure your session...</p>
        </div>
    </div>
);

// Access Denied Component
const AccessDenied = () => {
    const redirectToLogin = () => {
        const loginUrl = `/login?from=${encodeURIComponent('/app/myprofile')}&redirect=true&t=${Date.now()}`;
        window.location.href = loginUrl;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
                <p className="text-gray-600 mb-4">
                    This page is protected. Please login to access your profile.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={redirectToLogin}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login Page
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to construct proper image URL (PersonalDetails से लिया गया)
const getProfileImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    if (imagePath.startsWith('blob:')) {
        return imagePath;
    }

    if (imagePath.startsWith('profile_images/')) {
        return `${IMAGES_URL}/${imagePath}`;
    }

    if (!imagePath.startsWith('/')) {
        return `${IMAGES_URL}/${imagePath}`;
    }

    return `${IMAGES_URL}${imagePath}`;
};

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        return '';
    }
};

// Helper function to normalize gender value for dropdown
const normalizeGenderValue = (gender: string | undefined): string => {
    if (!gender) return '';

    const lowerGender = gender.toLowerCase();

    if (lowerGender.includes('male')) return 'male';
    if (lowerGender.includes('female')) return 'female';
    if (lowerGender.includes('other')) return 'other';
    if (lowerGender.includes('prefer') || lowerGender.includes('not')) return 'prefer-not-to-say';

    return gender;
};

// Helper function to normalize marital status value for dropdown
const normalizeMaritalStatusValue = (status: string | undefined): string => {
    if (!status) return '';

    const lowerStatus = status.toLowerCase();

    if (lowerStatus.includes('single')) return 'single';
    if (lowerStatus.includes('married')) return 'married';
    if (lowerStatus.includes('divorce')) return 'divorced';
    if (lowerStatus.includes('widow')) return 'widowed';

    return status;
};

// API Functions

const saveAddresses = async (userId: string, addresses: HomeAddress[]) => {
    try {

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('mode', 'addresses');
        formData.append('addresses', JSON.stringify(addresses));

        const response = await fetch(API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE, {
            method: 'POST',
            body: formData,
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`Server error ${response.status}: ${responseText}`);
        }

        const result = JSON.parse(responseText);

        if (result.success === false) {
            throw new Error(result.message || result.error || 'Server returned error');
        }

        return result;

    } catch (error) {
        throw error;
    }
};

const saveFamilyFriends = async (userId: string, familyFriends: FamilyFriend[]): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('mode', 'family_friends');
        formData.append('contacts', JSON.stringify(familyFriends));

        const response = await fetch(API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE, {
            method: 'POST',
            body: formData,
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`Failed to save family friends: ${response.status} ${responseText}`);
        }

        const result = JSON.parse(responseText);

        if (result.success === false) {
            throw new Error(result.message || result.error || 'Server returned error');
        }

        return result;
    } catch (error) {
        throw error;
    }
};

const saveCompleteProfile = async (userId: string, personalDetails: PersonalDetailsType, addresses: HomeAddress[], familyFriends: FamilyFriend[], imageFile?: File) => {
    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('mode', 'complete');

        formData.append('fullName', personalDetails.fullName || '');
        formData.append('email', personalDetails.email || '');
        formData.append('phone', personalDetails.phone || '');
        formData.append('dob', personalDetails.dob || '');
        formData.append('gender', personalDetails.gender || '');
        formData.append('occupation', personalDetails.occupation || '');
        formData.append('maritalStatus', personalDetails.maritalStatus || '');
        formData.append('addresses', JSON.stringify(addresses));
        formData.append('contacts', JSON.stringify(familyFriends));

        if (imageFile) {
            formData.append('profileImage', imageFile);
        }

        const response = await fetch(API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE, {
            method: 'POST',
            body: formData,
        });

        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Failed to save complete profile: ${response.status} ${responseText}`);
        }

        const result = JSON.parse(responseText);
        if (result.success === false) {
            throw new Error(result.message || result.error || 'Server returned error');
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export default function MyProfile() {
    const router = useRouter();
    const auth = useAuth();

    // Type assertion to fix the TypeScript error
    const user = auth.user as UserType | null;
    const { logout, isLoggedIn, isLoading } = auth;

    const [activeSection, setActiveSection] = useState('PersonalDetails');
    const [progress, setProgress] = useState(25);
    const [isUploading, setIsUploading] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [homeAddresses, setHomeAddresses] = useState<HomeAddress[]>([]);
    const [familyFriends, setFamilyFriends] = useState<FamilyFriend[]>([
        {
            id: 1,
            name: '',
            relationship: '',
            phone: '',
            email: '',
            address: ''
        }
    ]);

    // Personal Details state
    const [personalDetails, setPersonalDetails] = useState<PersonalDetailsType>({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        occupation: '',
        maritalStatus: ''
    });

    // Track if personal details are loaded from user
    const [isPersonalDetailsLoaded, setIsPersonalDetailsLoaded] = useState(false);

    // ✅ Profile Image State - PersonalDetails component से sync किया जाएगा
    const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
    const [userProfileImageFile, setUserProfileImageFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Refs for components
    const personalDetailsRef = useRef<PersonalDetailsHandle>(null);
    const addressDetailsRef = useRef<AddressDetailsHandle>(null);
    const familyFriendsRef = useRef<FamilyFriendsHandle>(null);

    // Track completed sections (saved to database)
    const [completedSections, setCompletedSections] = useState<CompletedSections>({
        PersonalDetails: false,
        Addresses: false,
        FamilyFriends: false,
        Completed: false
    });

    // Track section save status
    const [sectionSaveStatus, setSectionSaveStatus] = useState({
        PersonalDetails: { saved: false, saving: false },
        Addresses: { saved: false, saving: false },
        FamilyFriends: { saved: false, saving: false }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize data when user is available
    useEffect(() => {
        if (user && isLoggedIn && !isPersonalDetailsLoaded) {

            const userDob = user?.dob || user?.date_of_birth || '';
            const formattedDob = userDob ? formatDateForInput(userDob) : '';

            const userGender = user?.gender || '';
            const normalizedGender = normalizeGenderValue(userGender);

            const userMaritalStatus = user?.maritalStatus || user?.marital_status || '';
            const normalizedMaritalStatus = normalizeMaritalStatusValue(userMaritalStatus);

            const newPersonalDetails = {
                fullName: user?.fullname || user?.name || user?.fullName || '',
                email: user?.email || '',
                phone: user?.mobile || user?.phone || '',
                dob: formattedDob,
                gender: normalizedGender,
                occupation: user?.occupation || '',
                maritalStatus: normalizedMaritalStatus
            };

            setPersonalDetails(newPersonalDetails);
            setIsPersonalDetailsLoaded(true);

            // ✅ Profile image initialization
            if (user.profileImage || user.profile_image) {
                const imageUrl = getProfileImageUrl(user.profileImage || user.profile_image);
                setUserProfileImage(imageUrl);
            }

            if (user.home_address && Object.keys(user.home_address).length > 0) {
                const existingAddress: HomeAddress = {
                    full_name: user.home_address.full_name || user?.name || user?.fullName || '',
                    address_line: user.home_address.address_line || '',
                    area: user.home_address.area || '',
                    landmark: user.home_address.landmark || '',
                    contact_mobile: user.home_address.contact_mobile || user?.mobile || user?.phone || '',
                    city: user.home_address.city || '',
                    state: user.home_address.state || '',
                    district: user.home_address.district || '',
                    pincode: user.home_address.pincode || '',
                    landline_std: user.home_address.landline_std || '',
                    landline_number: user.home_address.landline_number || '',
                    email: user.home_address.email || user?.email || '',
                    address_tag: user.home_address.address_tag || 'Home',
                    is_primary: user.home_address.is_primary || 0, // Changed to number
                    is_active: user.home_address.is_active,
                    user_id: user.home_address.user_id,
                    id: user.home_address.id,
                    created_at: user.home_address.created_at,
                    updated_at: user.home_address.updated_at
                };

                setHomeAddresses([existingAddress]);

                setCompletedSections(prev => ({
                    ...prev,
                    Addresses: true
                }));
                setSectionSaveStatus(prev => ({
                    ...prev,
                    Addresses: { saved: true, saving: false }
                }));
            } else if (homeAddresses.length === 0) {
                // Initial address setup
                const initialAddress: HomeAddress = {
                    full_name: user?.name || user?.fullname || user?.fullName || '',
                    address_line: '',
                    area: '',
                    landmark: '',
                    contact_mobile: user?.mobile || user?.phone || '',
                    city: '',
                    state: '',
                    district: '',
                    pincode: '',
                    landline_std: '',
                    landline_number: '',
                    email: user?.email || '',
                    address_tag: 'Home',
                    is_primary: 1 // Changed to number (1 for true, 0 for false)
                };

                setHomeAddresses([initialAddress]);
            }

            if (user.family_friends && Array.isArray(user.family_friends) && user.family_friends.length > 0) {
                const existingFamilyFriends: FamilyFriend[] = user.family_friends.map((friend: any, index: number) => ({
                    id: index + 1,
                    name: friend.name || '',
                    relationship: friend.relationship || '',
                    phone: friend.phone || '',
                    email: friend.email || '',
                    address: friend.address || ''
                }));

                setFamilyFriends(existingFamilyFriends);

                setCompletedSections(prev => ({
                    ...prev,
                    FamilyFriends: true
                }));
                setSectionSaveStatus(prev => ({
                    ...prev,
                    FamilyFriends: { saved: true, saving: false }
                }));
            }

            if (newPersonalDetails.fullName && newPersonalDetails.email && newPersonalDetails.phone && newPersonalDetails.dob) {
                setCompletedSections(prev => ({
                    ...prev,
                    PersonalDetails: true
                }));
                setSectionSaveStatus(prev => ({
                    ...prev,
                    PersonalDetails: { saved: true, saving: false }
                }));
            }
        }
    }, [user, isLoggedIn, isPersonalDetailsLoaded]);

    // Update progress based on saved sections
    useEffect(() => {
        let newProgress = 25;
        if (completedSections.PersonalDetails) newProgress = 50;
        if (completedSections.Addresses) newProgress = 75;
        if (completedSections.FamilyFriends) newProgress = 100;
        setProgress(newProgress);
    }, [completedSections]);

    // Handle logout
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Confirm Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            logout();
            Swal.fire({
                title: 'Logged Out',
                text: 'You have been successfully logged out.',
                icon: 'success',
                confirmButtonColor: '#3B82F6',
                confirmButtonText: 'OK'
            });
        }
        setShowUserDropdown(false);
    };

    // Validate form based on active section
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (activeSection === 'FamilyFriends') {
            familyFriends.forEach((contact, index) => {
                if (!contact.name.trim()) {
                    newErrors[`family_name_${index}`] = 'Name is required';
                }
                if (!contact.relationship.trim()) {
                    newErrors[`relationship_${index}`] = 'Relationship is required';
                }
                if (!contact.phone.trim()) {
                    newErrors[`family_phone_${index}`] = 'Phone is required';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save current section to database
    const saveCurrentSection = async (): Promise<boolean> => {

        if (!user || !user.id) {
            await Swal.fire({
                title: 'Authentication Error',
                text: 'User not authenticated. Please login again.',
                icon: 'error',
                confirmButtonColor: '#EF4444',
                confirmButtonText: 'OK'
            });
            return false;
        }

        setIsUploading(true);
        setSectionSaveStatus(prev => ({
            ...prev,
            [activeSection]: { ...prev[activeSection as keyof typeof prev], saving: true }
        }));

        try {
            let result;
            let saved = false;

            switch (activeSection) {
                case 'PersonalDetails':
                    // ✅ PersonalDetails component के handleSave method को call करें
                    if (personalDetailsRef.current) {
                        saved = await personalDetailsRef.current.handleSave();
                    } else {
                        // Fallback: यदि ref नहीं है तो manual save करें
                        if (!user || !user.id) return false;

                        // PersonalDetails API call
                        const formData = new FormData();
                        formData.append('userId', user.id);
                        formData.append('mode', 'personal_details');
                        formData.append('fullName', personalDetails.fullName || '');
                        formData.append('email', personalDetails.email || '');
                        formData.append('phone', personalDetails.phone || '');
                        formData.append('dob', personalDetails.dob || '');
                        formData.append('gender', personalDetails.gender || '');
                        formData.append('occupation', personalDetails.occupation || '');
                        formData.append('maritalStatus', personalDetails.maritalStatus || '');

                        if (userProfileImageFile) {
                            formData.append('profileImage', userProfileImageFile);
                        }

                        const response = await fetch(API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE, {
                            method: 'POST',
                            body: formData,
                        });

                        const responseText = await response.text();

                        if (!response.ok) {
                            throw new Error(`Failed to save personal details: ${response.status} ${responseText}`);
                        }

                        result = JSON.parse(responseText);
                        saved = result.success;

                        if (saved) {
                            // ✅ Profile image को update करें
                            if (result.imageUrl || result.image_path) {
                                const newImageUrl = getProfileImageUrl(result.imageUrl || result.image_path);
                                setUserProfileImage(newImageUrl);
                                setUserProfileImageFile(null);
                            }
                        }
                    }

                    if (saved) {
                        setSectionSaveStatus(prev => ({
                            ...prev,
                            PersonalDetails: { saved: true, saving: false }
                        }));
                        setCompletedSections(prev => ({
                            ...prev,
                            PersonalDetails: true
                        }));
                        return true;
                    } else {
                        return false;
                    }

                case 'Addresses':
                    // ✅ AddressDetails component के handleSave method को call करें
                    if (addressDetailsRef.current) {
                        saved = await addressDetailsRef.current.handleSave();
                    } else {
                        // Fallback: यदि ref नहीं है तो manual save करें
                        if (!user || !user.id) return false;

                        // When ref.current is null, we can't call getAddresses on it
                        // So we use the homeAddresses state directly
                        result = await saveAddresses(user.id, homeAddresses);
                        saved = result.success;
                    }

                    if (saved) {
                        setSectionSaveStatus(prev => ({
                            ...prev,
                            Addresses: { saved: true, saving: false }
                        }));
                        setCompletedSections(prev => ({
                            ...prev,
                            Addresses: true
                        }));
                        return true;
                    }
                    return false;

                case 'FamilyFriends':
                    if (familyFriendsRef.current) {
                        saved = await familyFriendsRef.current.handleSave();
                    } else {
                        // Fallback: यदि ref नहीं है तो manual save करें
                        if (!user || !user.id) return false;

                        // When ref.current is null, use familyFriends state directly
                        result = await saveFamilyFriends(user.id, familyFriends);
                        saved = result.success;
                    }

                    if (saved) {
                        setSectionSaveStatus(prev => ({
                            ...prev,
                            FamilyFriends: { saved: true, saving: false }
                        }));
                        setCompletedSections(prev => ({
                            ...prev,
                            FamilyFriends: true
                        }));
                        return true;
                    }
                    return false;

                // In your saveCurrentSection function in MyProfile component
                case 'Completed':
                    console.log('🔍 MyProfile: Saving Complete Profile');
                    result = await saveCompleteProfile(
                        user.id,
                        personalDetails,
                        homeAddresses,
                        familyFriends,
                        userProfileImageFile || undefined
                    );

                    if (result.success) {
                        setCompletedSections(prev => ({
                            ...prev,
                            Completed: true
                        }));

                        await Swal.fire({
                            title: '🎉 Profile Completed!',
                            html: `
                <div class="text-center">
                  <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h4 class="text-lg font-bold text-gray-700 mb-2">Congratulations!</h4>
                  <p class="text-gray-600">Your complete profile has been saved successfully.</p>
                  <p class="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
                </div>
              `,
                            icon: 'success',
                            confirmButtonColor: '#10B981',
                            confirmButtonText: 'Continue',
                            timer: 3000,
                            didClose: () => {
                                // Redirect after the modal is closed
                                router.push('/UserDashboard');
                            }
                        }).then((result) => {
                            // If user clicks "Continue" button or timer completes, redirect
                            if (result.isConfirmed || result.isDismissed) {
                                window.location.href = '/UserDashboard';
                            }
                        });

                        return true;
                    }
                    break;
            }

            return false;

        } catch (error) {
            let errorMessage = 'Failed to save data. Please check your connection and try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            await Swal.fire({
                title: 'Save Failed',
                html: `
          <div class="text-center">
            <div class="mb-4">
              <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-gray-700 mb-2">Save Failed</h4>
            <p class="text-gray-600 text-sm">${errorMessage}</p>
          </div>
        `,
                icon: 'error',
                confirmButtonColor: '#EF4444',
                confirmButtonText: 'OK'
            });

            return false;
        } finally {
            setIsUploading(false);
            setSectionSaveStatus(prev => ({
                PersonalDetails: { ...prev.PersonalDetails, saving: false },
                Addresses: { ...prev.Addresses, saving: false },
                FamilyFriends: { ...prev.FamilyFriends, saving: false }
            }));
        }
    };

    // Handle Save & Continue button
    const handleSaveAndContinue = async () => {
        const saved = await saveCurrentSection();

        if (!saved) {
            return;
        }

        switch (activeSection) {
            case 'PersonalDetails':
                setActiveSection('Addresses');
                break;
            case 'Addresses':
                setActiveSection('FamilyFriends');
                break;
            case 'FamilyFriends':
                setActiveSection('Completed');
                break;
            case 'Completed':
                break;
        }
    };

    // Handle section click - Only allow if previous section is saved
    const handleSectionClick = async (sectionId: string) => {
        if (!isSectionAccessible(sectionId)) {
            let message = '';

            switch (sectionId) {
                case 'Addresses':
                    if (!completedSections.PersonalDetails) {
                        message = 'Please save Personal Details first before moving to Address Details.';
                    }
                    break;
                case 'FamilyFriends':
                    if (!completedSections.PersonalDetails) {
                        message = 'Please save Personal Details first before moving to Family & Friends.';
                    } else if (!completedSections.Addresses) {
                        message = 'Please save Address Details first before moving to Family & Friends.';
                    }
                    break;
                case 'Completed':
                    if (!completedSections.PersonalDetails) {
                        message = 'Please save Personal Details first.';
                    } else if (!completedSections.Addresses) {
                        message = 'Please save Address Details first.';
                    } else if (!completedSections.FamilyFriends) {
                        message = 'Please save Family & Friends first.';
                    }
                    break;
            }

            if (message) {
                await Swal.fire({
                    title: 'Complete Previous Section',
                    text: message,
                    icon: 'warning',
                    confirmButtonColor: '#F59E0B',
                    confirmButtonText: 'OK'
                });
            }
            return;
        }

        setActiveSection(sectionId);
    };

    // Show loading spinner
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Show access denied if not logged in
    if (!isLoggedIn || !user) {
        return <AccessDenied />;
    }

    // Profile sections data
    const profileSections = [
        {
            id: 'PersonalDetails',
            name: 'Personal Details',
            number: '1',
            description: 'Basic information about yourself',
            icon: User
        },
        {
            id: 'Addresses',
            name: 'Address Details',
            number: '2',
            description: 'Where you live and work',
            icon: Home
        },
        {
            id: 'FamilyFriends',
            name: 'Family & Friends',
            number: '3',
            description: 'Your close contacts',
            icon: Users
        },
        {
            id: 'Completed',
            name: 'Review & Complete',
            number: '4',
            description: 'Finalize your profile',
            icon: CheckCircle
        }
    ];

    // User data
    const userName = personalDetails.fullName || user?.fullname || user?.name || user?.fullName || 'Guest User';
    const userPhone = personalDetails.phone || user?.mobile || user?.phone || 'No phone number';
    const userEmail = personalDetails.email || user?.email || 'No email';
    const userInitial = userName.charAt(0).toUpperCase();

    // Progress color
    const getProgressColor = (percent: number) => {
        if (percent < 30) return 'bg-red-500';
        if (percent < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // Check if section is accessible (previous section must be saved)
    const isSectionAccessible = (sectionId: string): boolean => {
        switch (sectionId) {
            case 'PersonalDetails':
                return true;
            case 'Addresses':
                return completedSections.PersonalDetails;
            case 'FamilyFriends':
                return completedSections.PersonalDetails && completedSections.Addresses;
            case 'Completed':
                return completedSections.PersonalDetails && completedSections.Addresses && completedSections.FamilyFriends;
            default:
                return false;
        }
    };

    // Get section save status
    const getSectionSaveStatus = (sectionId: string) => {
        return sectionSaveStatus[sectionId as keyof typeof sectionSaveStatus] || { saved: false, saving: false };
    };

    // Render Personal Details Form - ✅ ref को pass किया गया है
    const renderPersonalDetails = () => (
        <PersonalDetails
            ref={personalDetailsRef}
            user={user}
            isSaving={sectionSaveStatus.PersonalDetails.saving}
            onSaveSuccess={(result) => {
                setSectionSaveStatus(prev => ({
                    ...prev,
                    PersonalDetails: { saved: true, saving: false }
                }));
                setCompletedSections(prev => ({
                    ...prev,
                    PersonalDetails: true
                }));

                if (result.personalDetails) {
                    setPersonalDetails(result.personalDetails);
                }

                // ✅ Profile image को update करें
                if (result.imageUrl || result.image_path) {
                    const newImageUrl = getProfileImageUrl(result.imageUrl || result.image_path);
                    setUserProfileImage(newImageUrl);
                    setUserProfileImageFile(null);
                }
            }}
            onImageChange={(imageUrl, imageFile) => {
                // ✅ Profile image को state में update करें
                setUserProfileImage(imageUrl);
                setUserProfileImageFile(imageFile || null);
            }}
            initialPersonalDetails={personalDetails}
            completed={completedSections.PersonalDetails}
            isUploading={isUploading}
        />
    );

    // ✅ Render Address Details Form
    const renderAddressDetails = () => {
        // Create a compatible addresses array with is_primary as number
        const compatibleAddresses = homeAddresses.map(addr => ({
            ...addr,
            // Ensure all required fields are present
            full_name: addr.full_name || '',
            address_line: addr.address_line || '',
            area: addr.area || '',
            landmark: addr.landmark || '',
            contact_mobile: addr.contact_mobile || '',
            city: addr.city || '',
            state: addr.state || '',
            district: addr.district || '',
            pincode: addr.pincode || '',
            landline_std: addr.landline_std || '',
            landline_number: addr.landline_number || '',
            email: addr.email || '',
            address_tag: addr.address_tag || 'Home',
            is_primary: addr.is_primary || 0, // Ensure is_primary is a number
            is_active: addr.is_active || 1,
            user_id: addr.user_id || (user?.id ? parseInt(user.id) : 0),
            id: addr.id || 0,
            created_at: addr.created_at || new Date().toISOString(),
            updated_at: addr.updated_at || new Date().toISOString()
        }));

        return (
            <AddressDetails
                ref={addressDetailsRef}
                user={user}
                initialAddresses={compatibleAddresses}
                isSaving={sectionSaveStatus.Addresses.saving}
                completed={completedSections.Addresses}
                onSave={async (addresses: HomeAddress[]) => {
                    if (!user || !user.id) {
                        await Swal.fire({
                            title: 'Authentication Error',
                            text: 'User not authenticated. Please login again.',
                            icon: 'error',
                            confirmButtonColor: '#EF4444',
                            confirmButtonText: 'OK'
                        });
                        return { success: false, message: 'User not authenticated' };
                    }

                    try {
                        const result = await saveAddresses(user.id, addresses);
                        return result;
                    } catch (error) {
                        console.error('Error saving addresses:', error);
                        throw error;
                    }
                }}
                onSaveSuccess={(result: any) => {
                    setSectionSaveStatus(prev => ({
                        ...prev,
                        Addresses: { saved: true, saving: false }
                    }));
                    setCompletedSections(prev => ({
                        ...prev,
                        Addresses: true
                    }));

                    Swal.fire({
                        title: '✅ Addresses Saved!',
                        text: 'Your addresses have been saved successfully to the database.',
                        icon: 'success',
                        confirmButtonColor: '#10B981',
                        confirmButtonText: 'Continue',
                        timer: 3000
                    });
                }}
                onAddressesChange={(addresses: HomeAddress[]) => {
                    setHomeAddresses(addresses);
                }}
                apiEndpoint={API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE}
            />
        );
    };

    // Render Family & Friends Form
    const renderFamilyFriends = () => (
        <FamilyFriends
            ref={familyFriendsRef}
            user={user}
            initialContacts={familyFriends}
            isSaving={sectionSaveStatus.FamilyFriends.saving}
            completed={completedSections.FamilyFriends}
            onSave={async (contacts: FamilyFriend[]) => {
                if (!user || !user.id) {
                    await Swal.fire({
                        title: 'Authentication Error',
                        text: 'User not authenticated. Please login again.',
                        icon: 'error',
                        confirmButtonColor: '#EF4444',
                        confirmButtonText: 'OK'
                    });
                    return { success: false };
                }

                try {
                    const result = await saveFamilyFriends(user.id, contacts);
                    return result;
                } catch (error) {
                    throw error;
                }
            }}
            onSaveSuccess={(result: any) => {
                setSectionSaveStatus(prev => ({
                    ...prev,
                    FamilyFriends: { saved: true, saving: false }
                }));
                setCompletedSections(prev => ({
                    ...prev,
                    FamilyFriends: true
                }));

                Swal.fire({
                    title: '✅ Contacts Saved!',
                    text: 'Your family and friends contacts have been saved successfully.',
                    icon: 'success',
                    confirmButtonColor: '#10B981',
                    confirmButtonText: 'Continue',
                    timer: 3000
                });
            }}
            onContactsChange={(updatedContacts: FamilyFriend[]) => {
                setFamilyFriends(updatedContacts);
            }}
            apiEndpoint={API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE}
        />
    );

    // Render Review & Complete - ✅ profileImage को शामिल किया
    const renderReviewComplete = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={48} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Review & Complete</h3>
                <p className="text-gray-600 mt-2">Review all your information before final submission</p>

                {completedSections.PersonalDetails && completedSections.Addresses && completedSections.FamilyFriends ? (
                    <div className="mt-4 inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full">
                        <CheckCircle size={16} className="mr-2" />
                        <span className="text-sm font-medium">All sections saved to database</span>
                    </div>
                ) : (
                    <div className="mt-4 inline-flex items-center bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full">
                        <AlertCircle size={16} className="mr-2" />
                        <span className="text-sm font-medium">Complete all sections first</span>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {/* Profile Image Review - ✅ userProfileImage state का उपयोग किया */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                        <button
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                            onClick={() => setActiveSection('PersonalDetails')}
                        >
                            Edit
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
                            {userProfileImage ? (
                                <Image
                                    src={userProfileImage}
                                    alt="Profile"
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                    unoptimized={userProfileImage.startsWith('blob:')}
                                    sizes="(max-width: 80px) 100vw, 80px"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                                    <User size={32} className="text-blue-600" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium">
                                {userProfileImage ? 'Profile picture uploaded' : 'No profile picture'}
                            </p>
                            <p className="text-sm text-gray-500">Click Edit to change</p>
                        </div>
                    </div>
                </div>

                {/* Personal Details Review */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                        <button
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                            onClick={() => setActiveSection('PersonalDetails')}
                        >
                            Edit
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium text-lg">{personalDetails.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{personalDetails.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{personalDetails.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">{personalDetails.dob || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">
                                {personalDetails.gender === 'male' ? 'Male' :
                                    personalDetails.gender === 'female' ? 'Female' :
                                        personalDetails.gender === 'other' ? 'Other' :
                                            personalDetails.gender === 'prefer-not-to-say' ? 'Prefer not to say' :
                                                personalDetails.gender || 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Occupation</p>
                            <p className="font-medium">{personalDetails.occupation || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Marital Status</p>
                            <p className="font-medium">
                                {personalDetails.maritalStatus === 'single' ? 'Single' :
                                    personalDetails.maritalStatus === 'married' ? 'Married' :
                                        personalDetails.maritalStatus === 'divorced' ? 'Divorced' :
                                            personalDetails.maritalStatus === 'widowed' ? 'Widowed' :
                                                personalDetails.maritalStatus || 'Not specified'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center">
                            {completedSections.PersonalDetails ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle size={16} className="mr-2" />
                                    <span className="text-sm">Saved to database</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span className="text-sm">Not saved yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Addresses Review */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
                        <button
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                            onClick={() => setActiveSection('Addresses')}
                        >
                            Edit
                        </button>
                    </div>
                    <div className="space-y-4">
                        {homeAddresses.map((address, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                <div className="flex items-center space-x-2 mb-2">
                                    {address.address_tag === 'Home' ? <Home size={16} className="text-blue-600" /> :
                                        address.address_tag === 'Office' ? <Building size={16} className="text-green-600" /> :
                                            <MapPin size={16} className="text-purple-600" />}
                                    <h4 className="font-medium">{address.address_tag} Address</h4>
                                </div>
                                <p className="font-medium">{address.full_name}</p>
                                <p className="text-gray-700">{address.address_line}</p>
                                <p className="text-sm text-gray-500">
                                    {address.area && `${address.area}, `}
                                    {address.city}, {address.pincode}
                                </p>
                                {address.is_primary === 1 && (
                                    <div className="mt-2 inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                        <CheckCircle size={12} className="mr-1" />
                                        Primary Address
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center">
                            {completedSections.Addresses ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle size={16} className="mr-2" />
                                    <span className="text-sm">Saved to database</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span className="text-sm">Not saved yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Family & Friends Review */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Family & Friends</h3>
                        <button
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                            onClick={() => setActiveSection('FamilyFriends')}
                        >
                            Edit
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {familyFriends.map((contact, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <h4 className="font-medium mb-2">{contact.name}</h4>
                                <p className="text-sm text-gray-500">Relationship: {contact.relationship}</p>
                                <p className="text-sm text-gray-500">Phone: {contact.phone}</p>
                                {contact.email && (
                                    <p className="text-sm text-gray-500">Email: {contact.email}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center">
                            {completedSections.FamilyFriends ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle size={16} className="mr-2" />
                                    <span className="text-sm">Saved to database</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span className="text-sm">Not saved yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id="terms"
                            className="mt-1"
                            defaultChecked={true}
                        />
                        <div>
                            <label htmlFor="terms" className="text-sm font-medium text-gray-900">
                                I confirm that all the information provided is accurate and complete
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                                By submitting, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Get form title and description
    const getFormTitle = (): string => {
        switch (activeSection) {
            case 'PersonalDetails': return 'Personal Details';
            case 'Addresses': return 'Address Details';
            case 'FamilyFriends': return 'Family & Friends';
            case 'Completed': return 'Review & Complete';
            default: return 'Profile Setup';
        }
    };

    const getFormDescription = (): string => {
        switch (activeSection) {
            case 'PersonalDetails': return 'Fill in your basic personal information';
            case 'Addresses': return 'Add your home and other addresses';
            case 'FamilyFriends': return 'Add your emergency contacts and close ones';
            case 'Completed': return 'Review all your information before submitting';
            default: return 'Complete your profile step by step';
        }
    };

    const getStepNumber = (): string => {
        switch (activeSection) {
            case 'PersonalDetails': return '1';
            case 'Addresses': return '2';
            case 'FamilyFriends': return '3';
            case 'Completed': return '4';
            default: return '1';
        }
    };

    // Render active form section
    const renderActiveForm = () => {
        switch (activeSection) {
            case 'PersonalDetails': return renderPersonalDetails();
            case 'Addresses': return renderAddressDetails();
            case 'FamilyFriends': return renderFamilyFriends();
            case 'Completed': return renderReviewComplete();
            default: return renderPersonalDetails();
        }
    };

    // Main render
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="fixed top-4 right-4 bg-green-100 border border-green-300 rounded-lg p-2 text-xs z-50 flex items-center space-x-1">
                <Shield size={12} className="text-green-600" />
                <span className="text-green-800 font-medium">Secure Session</span>
            </div>

            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                {/* Back to Home button */}
                                <button
                                    onClick={() => router.push('/UserDashboard')}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                                    title="Back to Dashboard"
                                >
                                    <Home size={20} />
                                </button>

                                <div className="relative">
                                    {/* Header logo - ✅ userProfileImage का उपयोग किया */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                                        {userProfileImage ? (
                                            <Image
                                                src={userProfileImage}
                                                alt={userName}
                                                width={40}
                                                height={40}
                                                className="object-cover w-full h-full"
                                                unoptimized={userProfileImage.startsWith('blob:')}
                                                sizes="(max-width: 40px) 100vw, 40px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">{userInitial}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">Profile Setup</h1>
                                    <p className="text-sm text-gray-500">Complete your profile step by step</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900">{userName}</p>
                                <p className="text-sm text-gray-500">{userPhone}</p>
                            </div>

                            <div className="relative">
                                {/* User dropdown button - ✅ userProfileImage का उपयोग किया */}
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                                        {userProfileImage ? (
                                            <Image
                                                src={userProfileImage}
                                                alt={userName}
                                                width={40}
                                                height={40}
                                                className="object-cover w-full h-full"
                                                unoptimized={userProfileImage.startsWith('blob:')}
                                                sizes="(max-width: 40px) 100vw, 40px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                <span className="text-white font-medium text-sm">{userInitial}</span>
                                            </div>
                                        )}
                                    </div>
                                    <User size={16} className="text-gray-600" />
                                </button>

                                {showUserDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowUserDropdown(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                {/* Dropdown में profile image - ✅ userProfileImage का उपयोग किया */}
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                        {userProfileImage ? (
                                                            <Image
                                                                src={userProfileImage}
                                                                alt={userName}
                                                                width={32}
                                                                height={32}
                                                                className="object-cover w-full h-full"
                                                                unoptimized={userProfileImage.startsWith('blob:')}
                                                                sizes="(max-width: 32px) 100vw, 32px"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                                <span className="text-white font-medium text-xs">{userInitial}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        setShowUserDropdown(false);
                                                        router.push('/UserDashboard');
                                                    }}
                                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Home size={16} />
                                                    <span>Home</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowUserDropdown(false);
                                                        router.push('/app/myprofile');
                                                    }}
                                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <User size={16} />
                                                    <span>My Profile</span>
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Progress Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <div className="text-center mb-8">
                                <div className="relative inline-block mb-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">{progress}%</div>
                                            <div className="text-xs text-gray-500">Complete</div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent">
                                        <svg className="w-20 h-20 transform -rotate-90">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                className="text-gray-200"
                                            />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                strokeDasharray="226.2"
                                                strokeDashoffset={226.2 - (226.2 * progress) / 100}
                                                className={`${getProgressColor(progress)} transition-all duration-500`}
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Profile Completion
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {progress < 100 ? 'Save each section to continue' : 'All sections saved!'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {profileSections.map((section, index) => {
                                    const Icon = section.icon;
                                    const isAccessible = isSectionAccessible(section.id);
                                    const isCompleted = completedSections[section.id as keyof typeof completedSections];
                                    const isActive = activeSection === section.id;

                                    return (
                                        <div
                                            key={section.id}
                                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isActive
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : isCompleted
                                                    ? 'border-green-200 bg-green-50'
                                                    : !isAccessible
                                                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                } ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            onClick={() => isAccessible && handleSectionClick(section.id)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div
                                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isActive
                                                        ? 'bg-blue-500 text-white'
                                                        : isCompleted
                                                            ? 'bg-green-500 text-white'
                                                            : !isAccessible
                                                                ? 'bg-gray-300 text-gray-500'
                                                                : 'bg-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle size={16} />
                                                    ) : !isAccessible ? (
                                                        <Lock size={14} />
                                                    ) : (
                                                        section.number
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4
                                                        className={`text-sm font-semibold ${isActive
                                                            ? 'text-blue-900'
                                                            : isCompleted
                                                                ? 'text-green-900'
                                                                : !isAccessible
                                                                    ? 'text-gray-500'
                                                                    : 'text-gray-900'
                                                            }`}
                                                    >
                                                        {section.name}
                                                    </h4>
                                                    <p
                                                        className={`text-xs ${isActive
                                                            ? 'text-blue-700'
                                                            : isCompleted
                                                                ? 'text-green-700'
                                                                : !isAccessible
                                                                    ? 'text-gray-400'
                                                                    : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {section.description}
                                                    </p>
                                                    {isCompleted && (
                                                        <p className="text-xs text-green-600 mt-1 font-medium">
                                                            ✓ Saved to database
                                                        </p>
                                                    )}
                                                    {!isAccessible && (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            Save previous section first
                                                        </p>
                                                    )}
                                                </div>
                                                <Icon size={16} className={`${isActive
                                                    ? 'text-blue-600'
                                                    : isCompleted
                                                        ? 'text-green-600'
                                                        : !isAccessible
                                                            ? 'text-gray-300'
                                                            : 'text-gray-400'
                                                    }`} />
                                            </div>

                                            {index < profileSections.length - 1 && (
                                                <div
                                                    className={`absolute left-4 top-full w-0.5 h-4 -ml-px ${isCompleted ? 'bg-green-300' : 'bg-gray-200'
                                                        }`}
                                                    style={{ top: 'calc(100% + 0.5rem)' }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-blue-800 font-medium">Important Note</p>
                                        <p className="text-xs text-blue-600">
                                            You must save each section to the database before proceeding to the next section.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {getFormTitle()}
                                        </h2>
                                        <p className="text-blue-100 text-sm">
                                            {getFormDescription()}
                                        </p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-3 py-1">
                                        <span className="text-white text-sm font-medium">Step {getStepNumber()} of 4</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {renderActiveForm()}

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                                    <button
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                            switch (activeSection) {
                                                case 'Addresses':
                                                    setActiveSection('PersonalDetails');
                                                    break;
                                                case 'FamilyFriends':
                                                    setActiveSection('Addresses');
                                                    break;
                                                case 'Completed':
                                                    setActiveSection('FamilyFriends');
                                                    break;
                                            }
                                        }}
                                        disabled={activeSection === 'PersonalDetails'}
                                    >
                                        Back
                                    </button>

                                    <button
                                        className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center space-x-2 ${isUploading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                            }`}
                                        onClick={handleSaveAndContinue}
                                        disabled={isUploading || !user}
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Saving to database...</span>
                                            </>
                                        ) : activeSection === 'Completed' ? (
                                            <>
                                                <CheckCircle size={18} />
                                                <span>Complete Profile</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                <span>Save & Continue</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Save Status Note */}
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        {activeSection === 'Completed'
                                            ? 'Click "Complete Profile" to finalize your profile submission'
                                            : 'Click "Save & Continue" to save this section to database and proceed'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="max-w-7xl mx-auto px-4 py-4 text-center">
                <p className="text-xs text-gray-500">
                    🔒 Each section is saved individually to the database. Next section is locked until current section is saved.
                </p>
            </div>
        </div>  
    );
}