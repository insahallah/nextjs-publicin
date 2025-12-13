// app/myprofile/PersonalDetails.tsx
'use client';

import { useState, useRef, ChangeEvent, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Camera, User, AlertCircle, CheckCircle, X } from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { API_ENDPOINTS2 } from '@/configs/api';
import { IMAGES_URL } from '@/configs/api';

// TypeScript Interfaces
interface PersonalDetails {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    occupation: string;
    maritalStatus: string;
}

interface PersonalDetailsProps {
    user: {
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
    } | null;
    isSaving?: boolean;
    onSave?: (personalDetails: PersonalDetails, imageFile?: File) => Promise<boolean>;
    onImageChange?: (imageUrl: string, imageFile?: File) => void;
    onSaveSuccess?: (result: any) => void;
    initialPersonalDetails?: PersonalDetails;
    completed?: boolean;
    isUploading?: boolean;
}

export interface PersonalDetailsHandle {
    handleSave: () => Promise<boolean>;
}

// Helper function to construct proper image URL
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
        console.error('Error formatting date:', error);
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

// API Function - Directly included in component
const savePersonalDetailsAPI = async (
    userId: string,
    personalDetails: PersonalDetails,
    imageFile?: File
) => {
    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('mode', 'personal_details');

        // Append personal details
        formData.append('fullName', personalDetails.fullName || '');
        formData.append('email', personalDetails.email || '');
        formData.append('phone', personalDetails.phone || '');
        formData.append('dob', personalDetails.dob || '');
        formData.append('gender', personalDetails.gender || '');
        formData.append('occupation', personalDetails.occupation || '');
        formData.append('maritalStatus', personalDetails.maritalStatus || '');

        // Append image if exists
        if (imageFile) {
            formData.append('profileImage', imageFile);
        }

        const response = await fetch(API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE, {
            method: 'POST',
            body: formData,
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`Failed to save personal details: ${response.status} ${responseText}`);
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

// ADD THIS NEW FUNCTION TO FETCH USER PROFILE
const fetchUserProfile = async (userId: string) => {
    try {
        const response = await fetch(API_ENDPOINTS2.AUTH.FETCH_USER_SECTION_DATA_FOR_UPDATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

const PersonalDetails = forwardRef<PersonalDetailsHandle, PersonalDetailsProps>(({
    user,
    isSaving = false,
    onSave,
    onImageChange,
    onSaveSuccess,
    initialPersonalDetails,
    completed = false,
    isUploading = false
}: PersonalDetailsProps, ref) => {
    // Personal Details state
    const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(
        initialPersonalDetails || {
            fullName: user?.fullname || user?.name || user?.fullName || '',
            email: user?.email || '',
            phone: user?.mobile || user?.phone || '',
            dob: user?.dob || user?.date_of_birth ? formatDateForInput(user.dob || user.date_of_birth || '') : '',
            gender: normalizeGenderValue(user?.gender),
            occupation: user?.occupation || '',
            maritalStatus: normalizeMaritalStatusValue(user?.maritalStatus || user?.marital_status)
        }
    );

    // Profile Image States
    const [profileImage, setProfileImage] = useState<string | null>(
        user?.profileImage || user?.profile_image ?
            getProfileImageUrl(user.profileImage || user.profile_image) :
            null
    );
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user profile on component mount if user exists but details are incomplete
    useEffect(() => {
        const fetchProfileData = async () => {
            if (user?.id && (!user.email || !user.phone || !user.dob)) {
                try {
                    setIsLoading(true);
                    const profileData = await fetchUserProfile(user.id);
                    
                    if (profileData.success && profileData.user) {
                        const userData = profileData.user;
                        setPersonalDetails(prev => ({
                            ...prev,
                            fullName: userData.fullname || userData.name || prev.fullName,
                            email: userData.email || prev.email,
                            phone: userData.mobile || userData.phone || prev.phone,
                            dob: userData.dob || userData.date_of_birth ? formatDateForInput(userData.dob || userData.date_of_birth) : prev.dob,
                            gender: normalizeGenderValue(userData.gender) || prev.gender,
                            occupation: userData.occupation || prev.occupation,
                            maritalStatus: normalizeMaritalStatusValue(userData.maritalStatus || userData.marital_status) || prev.maritalStatus
                        }));
                        
                        if (userData.profile_image) {
                            const imageUrl = getProfileImageUrl(userData.profile_image);
                            setProfileImage(imageUrl);
                            // ✅ Parent component को भी image update करने दें
                            if (onImageChange) {
                                onImageChange(imageUrl, undefined); // FIXED: Changed from null to undefined
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        
        fetchProfileData();
    }, [user?.id]); // Only re-run if user.id changes

    // Handle personal details change
    const handlePersonalDetailsChange = (field: keyof PersonalDetails, value: string) => {
        setPersonalDetails(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!personalDetails.fullName.trim()) {
            newErrors['fullName'] = 'Full name is required';
        }
        if (!personalDetails.email.trim()) {
            newErrors['email'] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(personalDetails.email)) {
            newErrors['email'] = 'Email is invalid';
        }
        if (!personalDetails.phone.trim()) {
            newErrors['phone'] = 'Phone is required';
        } else if (!/^[6-9]\d{9}$/.test(personalDetails.phone.replace(/\D/g, ''))) {
            newErrors['phone'] = 'Phone number is invalid';
        }
        if (!personalDetails.dob.trim()) {
            newErrors['dob'] = 'Date of birth is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Save function (to be called from parent component)
    const handleSave = async (): Promise<boolean> => {
        console.log('🔍 PersonalDetails: handleSave called');
        
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

        if (!validateForm()) {
            const errorMessages = Object.values(errors).join(', ');
            await Swal.fire({
                title: 'Validation Error',
                html: `Please fix the following errors:<br/><br/>${errorMessages}`,
                icon: 'error',
                confirmButtonColor: '#EF4444',
                confirmButtonText: 'OK'
            });
            return false;
        }

        setSaving(true);

        try {
            let result;

            // If onSave prop is provided, use it
            if (onSave) {
                console.log('🔍 PersonalDetails: Using onSave prop');
                const saved = await onSave(personalDetails, profileImageFile || undefined);
                if (saved && onSaveSuccess) {
                    onSaveSuccess({ success: true, personalDetails });
                }
                setSaving(false);
                return saved;
            }

            // Otherwise use the built-in API function
            console.log('🔍 PersonalDetails: Using built-in API');
            result = await savePersonalDetailsAPI(
                user.id,
                personalDetails,
                profileImageFile || undefined
            );

            console.log('🔍 PersonalDetails: API result:', result);

            if (result.success) {
                // Update profile image locally if uploaded
                if (result.imageUrl || result.image_path) {
                    const newImageUrl = getProfileImageUrl(result.imageUrl || result.image_path);
                    setProfileImage(newImageUrl);
                    setProfileImageFile(null); // Clear the file after successful upload
                    
                    // ✅ Parent component को भी update करें
                    if (onImageChange) {
                        onImageChange(newImageUrl, undefined); // FIXED: Changed from null to undefined
                    }
                }

                if (onSaveSuccess) {
                    onSaveSuccess({ ...result, personalDetails });
                }

                await Swal.fire({
                    title: '✅ Personal Details Saved!',
                    text: 'Your personal details have been saved successfully to the database.',
                    icon: 'success',
                    confirmButtonColor: '#10B981',
                    confirmButtonText: 'Continue',
                    timer: 3000
                });

                setSaving(false);
                return true;
            }

            setSaving(false);
            return false;

        } catch (error) {
            let errorMessage = 'Failed to save data. Please check your connection and try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
                console.error('Save error:', error);
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

            setSaving(false);
            return false;
        }
    };

    // Expose handleSave method to parent component via ref
    useImperativeHandle(ref, () => ({
        handleSave
    }));

    // Profile Image Upload Functions
    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError('');

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setImageError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            await Swal.fire({
                title: 'Invalid File Type',
                text: 'Please select a valid image file (JPEG, PNG, GIF, or WebP).',
                icon: 'error',
                confirmButtonColor: '#EF4444',
                confirmButtonText: 'OK'
            });
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setImageError(`Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`);
            await Swal.fire({
                title: 'File Too Large',
                text: `Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit. Please select a smaller image.`,
                icon: 'error',
                confirmButtonColor: '#EF4444',
                confirmButtonText: 'OK'
            });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const imageUrl = reader.result as string;
            setProfileImage(imageUrl);
            setProfileImageFile(file);

            // ✅ CRITICAL: Parent component को image change notify करें
            if (onImageChange) {
                onImageChange(imageUrl, file);
            }

            Swal.fire({
                title: 'Image Selected',
                html: `
                    <div class="text-center">
                        <div class="mb-3">
                            <svg class="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <p class="font-medium">Profile picture selected!</p>
                        <p class="text-sm text-gray-600">Will be uploaded when you save Personal Details.</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: '#3B82F6',
                confirmButtonText: 'OK',
                timer: 3000
            });
        };
        reader.readAsDataURL(file);
    };

    const removeProfileImage = async () => {
        const result = await Swal.fire({
            title: 'Remove Profile Picture',
            text: 'Are you sure you want to remove your profile picture?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            setProfileImage(null);
            setProfileImageFile(null);
            setImageError('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // ✅ CRITICAL: Parent component को image removal notify करें
            if (onImageChange) {
                onImageChange('', undefined);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Check if fields are populated
    const fieldsPopulated = personalDetails.fullName &&
        personalDetails.email &&
        personalDetails.phone &&
        personalDetails.dob;

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your profile data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                {/* Profile Image Upload Section */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                        {profileImage ? (
                            <>
                                <Image
                                    src={profileImage}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized={profileImage.startsWith('blob:')}
                                    sizes="(max-width: 128px) 100vw, 128px"
                                />
                                <button
                                    onClick={removeProfileImage}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                    title="Remove image"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                                <User size={48} className="text-blue-600" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={triggerFileInput}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                        title="Upload profile image"
                    >
                        <Camera size={18} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                <p className="text-gray-600 mt-2">Please provide your basic details</p>

                {/* Show field status indicator */}
                {fieldsPopulated && (
                    <div className="mt-2 inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        <CheckCircle size={14} className="mr-1" />
                        <span className="text-sm">Fields populated from your account</span>
                    </div>
                )}

                {/* Save Status Indicator */}
                {completed && (
                    <div className="mt-2 inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                        <CheckCircle size={14} className="mr-1" />
                        <span className="text-sm">Saved to database</span>
                    </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                    <p>Click the camera icon to upload your profile picture</p>
                    <p className="text-xs">Max file size: 5MB • Supported formats: JPEG, PNG, GIF, WebP</p>
                </div>

                {imageError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                        <AlertCircle size={14} className="mr-1" />
                        {imageError}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors['fullName'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        value={personalDetails.fullName}
                        onChange={(e) => handlePersonalDetailsChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                    />
                    {errors['fullName'] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors['fullName']}
                        </p>
                    )}
                    {personalDetails.fullName && !errors['fullName'] && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ Name is filled
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors['email'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        value={personalDetails.email}
                        onChange={(e) => handlePersonalDetailsChange('email', e.target.value)}
                        placeholder="your@email.com"
                    />
                    {errors['email'] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors['email']}
                        </p>
                    )}
                    {personalDetails.email && !errors['email'] && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ Email is filled
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors['phone'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        value={personalDetails.phone}
                        onChange={(e) => handlePersonalDetailsChange('phone', e.target.value)}
                        placeholder="+91 9876543210"
                    />
                    {errors['phone'] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors['phone']}
                        </p>
                    )}
                    {personalDetails.phone && !errors['phone'] && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ Phone is filled
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                    </label>
                    <input
                        type="date"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors['dob'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        value={personalDetails.dob}
                        onChange={(e) => handlePersonalDetailsChange('dob', e.target.value)}
                    />
                    {errors['dob'] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors['dob']}
                        </p>
                    )}
                    {personalDetails.dob && !errors['dob'] && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ Date of birth is filled: {personalDetails.dob}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                    </label>
                    <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={personalDetails.gender}
                        onChange={(e) => handlePersonalDetailsChange('gender', e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {personalDetails.gender && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ Gender selected: {personalDetails.gender === 'male' ? 'Male' :
                                personalDetails.gender === 'female' ? 'Female' :
                                    personalDetails.gender === 'other' ? 'Other' :
                                        personalDetails.gender === 'prefer-not-to-say' ? 'Prefer not to say' :
                                            personalDetails.gender}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation
                    </label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={personalDetails.occupation}
                        onChange={(e) => handlePersonalDetailsChange('occupation', e.target.value)}
                        placeholder="Your profession"
                    />
                    {personalDetails.occupation && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ Occupation filled
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marital Status
                    </label>
                    <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={personalDetails.maritalStatus}
                        onChange={(e) => handlePersonalDetailsChange('maritalStatus', e.target.value)}
                    >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                    </select>
                    {personalDetails.maritalStatus && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ Marital status selected: {personalDetails.maritalStatus === 'single' ? 'Single' :
                                personalDetails.maritalStatus === 'married' ? 'Married' :
                                    personalDetails.maritalStatus === 'divorced' ? 'Divorced' :
                                        personalDetails.maritalStatus === 'widowed' ? 'Widowed' :
                                            personalDetails.maritalStatus}
                        </p>
                    )}
                </div>
            </div>

            {/* Summary of filled fields */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Required Fields Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className={`flex items-center space-x-1 ${personalDetails.fullName ? 'text-green-600' : 'text-red-600'}`}>
                        {personalDetails.fullName ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        <span className="text-xs">Full Name</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${personalDetails.email ? 'text-green-600' : 'text-red-600'}`}>
                        {personalDetails.email ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        <span className="text-xs">Email</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${personalDetails.phone ? 'text-green-600' : 'text-red-600'}`}>
                        {personalDetails.phone ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        <span className="text-xs">Phone</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${personalDetails.dob ? 'text-green-600' : 'text-red-600'}`}>
                        {personalDetails.dob ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        <span className="text-xs">Date of Birth</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    <div className={`flex items-center space-x-1 ${personalDetails.gender ? 'text-green-600' : 'text-yellow-600'}`}>
                        {personalDetails.gender ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        <span className="text-xs">Gender</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${personalDetails.occupation ? 'text-green-600' : 'text-yellow-600'}`}>
                        {personalDetails.occupation ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        <span className="text-xs">Occupation</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${personalDetails.maritalStatus ? 'text-green-600' : 'text-yellow-600'}`}>
                        {personalDetails.maritalStatus ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        <span className="text-xs">Marital Status</span>
                    </div>
                </div>
            </div>

            {/* Save button removed - Function will be called from parent component's "Save & Continue" button */}
        </div>
    );
});

PersonalDetails.displayName = 'PersonalDetails';

export default PersonalDetails;