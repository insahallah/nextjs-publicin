'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Users, Plus, AlertCircle, CheckCircle, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS2 } from '@/configs/api';

// TypeScript Interfaces
interface FamilyFriend {
    id: number;
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
}

interface User {
    id: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    family_friends?: Array<{
        id?: number;
        name?: string;
        relationship?: string;
        phone?: string;
        email?: string;
        address?: string;
    }>;
}

interface FamilyFriendsProps {
    user: User | null;
    initialContacts?: FamilyFriend[];
    isSaving?: boolean;
    completed?: boolean;
    onSave?: (contacts: FamilyFriend[]) => Promise<any>;
    onSaveSuccess?: (result: any) => void;
    onContactsChange?: (contacts: FamilyFriend[]) => void;
    apiEndpoint?: string;
    forceRefresh?: boolean; // New prop to force refresh from API
}

export interface FamilyFriendsHandle {
    handleSave: () => Promise<boolean>;
    getContacts: () => FamilyFriend[];
    validateForm: () => boolean;
    loadContactsFromAPI: () => Promise<void>;
    refreshContacts: () => Promise<void>; // New method
}

// Fetch family friends data from API
const fetchFamilyFriendsData = async (userId: string) => {
    try {
        console.log('🚀 Fetching family friends data for user:', userId);
        console.log('🚀 API Endpoint:', API_ENDPOINTS2?.AUTH?.FETCH_FEMILYFRIEND_DATA_FOR_UPDATE || 'Not defined');
        
        if (!API_ENDPOINTS2?.AUTH?.FETCH_FEMILYFRIEND_DATA_FOR_UPDATE) {
            throw new Error('API endpoint not defined');
        }
        
        const requestBody = { user_id: parseInt(userId) };
        console.log('🚀 Request Body:', requestBody);
        
        const response = await fetch(API_ENDPOINTS2.AUTH.FETCH_FEMILYFRIEND_DATA_FOR_UPDATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        console.log('🚀 Response Status:', response.status);
        
        const responseText = await response.text();
        console.log('🚀 Raw Response Text (first 500 chars):', responseText.substring(0, 500));
        
        if (!response.ok) {
            throw new Error(`Failed to fetch family friends data: ${response.status} - ${responseText}`);
        }
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('🚀 JSON Parse Error:', parseError);
            throw new Error(`Invalid JSON response from server`);
        }
        
        console.log('🚀 Parsed API response:', result);
        console.log('🚀 Response success:', result.success);
        
        return result;
    } catch (error) {
        console.error('🚀 Error fetching family friends data:', error);
        throw error;
    }
};

// Initial contact data structure
const initialFamilyFriend = (): FamilyFriend => ({
    id: Date.now(),
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: ''
});

// Default relationship options
const relationshipOptions = [
    { value: '', label: 'Select Relationship' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'grandchild', label: 'Grandchild' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'cousin', label: 'Cousin' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'other', label: 'Other' }
];

const FamilyFriends = forwardRef<FamilyFriendsHandle, FamilyFriendsProps>(
    function FamilyFriends({
        user,
        initialContacts = [],
        isSaving = false,
        completed = false,
        onSave,
        onSaveSuccess,
        onContactsChange,
        apiEndpoint = '',
        forceRefresh = false // Default to false
    }, ref) {
        const [contacts, setContacts] = useState<FamilyFriend[]>(
            initialContacts.length > 0 ? initialContacts : [initialFamilyFriend()]
        );
        const [errors, setErrors] = useState<Record<string, string>>({});
        const [localIsSaving, setLocalIsSaving] = useState(false);
        const [localCompleted, setLocalCompleted] = useState(completed);
        const [isLoading, setIsLoading] = useState(false);
        const [hasFetchedData, setHasFetchedData] = useState(false);
        const [shouldForceRefresh, setShouldForceRefresh] = useState(forceRefresh);

        // Fetch family friends data when component mounts or user changes
        useEffect(() => {
            console.log('🎯 [FamilyFriends] useEffect triggered');
            console.log('🎯 User ID:', user?.id);
            console.log('🎯 Has fetched data:', hasFetchedData);
            console.log('🎯 Initial contacts length:', initialContacts?.length || 0);
            console.log('🎯 Should force refresh:', shouldForceRefresh);
            
            const loadFamilyFriendsData = async () => {
                // Skip if no user
                if (!user?.id) {
                    console.log('⏭️ Skipping fetch: No user ID');
                    return;
                }
                
                // Skip if already fetched and not forcing refresh
                if (hasFetchedData && !shouldForceRefresh) {
                    console.log('⏭️ Skipping fetch: Already fetched and not forcing refresh');
                    return;
                }

                try {
                    console.log('🔄 Starting data fetch from API...');
                    setIsLoading(true);
                    
                    const result = await fetchFamilyFriendsData(user.id);
                    
                    console.log('✅ Fetch result:', result);
                    
                    if (result.success) {
                        let familyFriendsData = [];
                        
                        // Try different response formats
                        if (result.family_friends && Array.isArray(result.family_friends)) {
                            familyFriendsData = result.family_friends;
                        } else if (result.data && Array.isArray(result.data)) {
                            familyFriendsData = result.data;
                        } else if (Array.isArray(result)) {
                            familyFriendsData = result;
                        }
                        
                        console.log('📊 Found data format with', familyFriendsData.length, 'contacts');
                        
                        if (familyFriendsData.length > 0) {
                            const formattedContacts: FamilyFriend[] = familyFriendsData.map((friend: any, index: number) => ({
                                id: friend.id || index + 1,
                                name: friend.name || '',
                                relationship: friend.relationship || '',
                                phone: friend.phone || '',
                                email: friend.email || '',
                                address: friend.address || ''
                            }));
                            
                            console.log('📝 Setting formatted contacts:', formattedContacts);
                            setContacts(formattedContacts);
                            
                            if (onContactsChange) {
                                onContactsChange(formattedContacts);
                            }
                            
                            // Mark as completed if data exists
                            if (formattedContacts.some(contact => contact.name && contact.phone)) {
                                setLocalCompleted(true);
                                console.log('✅ Contacts exist, marking as completed');
                            }
                        } else {
                            console.log('📭 No contacts found in database, keeping initial contacts');
                            // Keep initial contacts if no data from API
                            if (initialContacts.length > 0) {
                                setContacts(initialContacts);
                            }
                        }
                    } else {
                        console.log('❌ API returned success: false');
                        console.log('Error message:', result.message);
                        // Keep initial contacts on API failure
                        if (initialContacts.length > 0) {
                            setContacts(initialContacts);
                        }
                    }
                    
                    setHasFetchedData(true);
                    setShouldForceRefresh(false); // Reset force refresh flag
                    
                } catch (error) {
                    console.error('💥 Failed to load family friends data:', error);
                    
                    // Keep initial contacts on error
                    if (initialContacts.length > 0) {
                        setContacts(initialContacts);
                    }
                    
                    // Don't show error for initial load, only for manual refresh
                    setHasFetchedData(true);
                    setShouldForceRefresh(false);
                } finally {
                    setIsLoading(false);
                }
            };
            
            loadFamilyFriendsData();
        }, [user?.id, shouldForceRefresh]); // Remove initialContacts from dependencies

        // Sync with parent completed prop
        useEffect(() => {
            setLocalCompleted(completed);
        }, [completed]);

        // Sync with parent initialContacts when they change
        useEffect(() => {
            if (initialContacts.length > 0 && !hasFetchedData) {
                console.log('📥 Setting contacts from initialContacts (first load):', initialContacts);
                setContacts(initialContacts);
            }
        }, [initialContacts, hasFetchedData]);

        // Function to refresh contacts from API
        const refreshContacts = async (): Promise<void> => {
            if (!user?.id) {
                console.error('No user ID available');
                return;
            }

            try {
                setIsLoading(true);
                console.log('🔄 Manually refreshing contacts from API...');
                
                const result = await fetchFamilyFriendsData(user.id);
                
                if (result.success) {
                    let familyFriendsData = [];
                    
                    if (result.family_friends && Array.isArray(result.family_friends)) {
                        familyFriendsData = result.family_friends;
                    } else if (result.data && Array.isArray(result.data)) {
                        familyFriendsData = result.data;
                    } else if (Array.isArray(result)) {
                        familyFriendsData = result;
                    }
                    
                    if (familyFriendsData.length > 0) {
                        const formattedContacts: FamilyFriend[] = familyFriendsData.map((friend: any, index: number) => ({
                            id: friend.id || index + 1,
                            name: friend.name || '',
                            relationship: friend.relationship || '',
                            phone: friend.phone || '',
                            email: friend.email || '',
                            address: friend.address || ''
                        }));
                        
                        setContacts(formattedContacts);
                        
                        if (onContactsChange) {
                            onContactsChange(formattedContacts);
                        }
                        
                        await Swal.fire({
                            title: 'Contacts Refreshed',
                            text: `Loaded ${formattedContacts.length} contacts from database.`,
                            icon: 'success',
                            confirmButtonColor: '#10B981',
                            confirmButtonText: 'OK',
                            timer: 2000
                        });
                    } else {
                        await Swal.fire({
                            title: 'No Contacts Found',
                            text: 'No contacts found in the database.',
                            icon: 'info',
                            confirmButtonColor: '#3B82F6',
                            confirmButtonText: 'OK'
                        });
                    }
                } else {
                    await Swal.fire({
                        title: 'Refresh Failed',
                        text: result.message || 'Could not refresh contacts.',
                        icon: 'error',
                        confirmButtonColor: '#EF4444',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Failed to refresh contacts:', error);
                await Swal.fire({
                    title: 'Refresh Failed',
                    text: 'Could not refresh contacts. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#EF4444',
                    confirmButtonText: 'OK'
                });
            } finally {
                setIsLoading(false);
            }
        };

        // Function to load contacts from API manually (same as refresh)
        const loadContactsFromAPI = refreshContacts;

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            handleSave,
            getContacts: () => contacts,
            validateForm,
            loadContactsFromAPI,
            refreshContacts
        }));

        // Handle contact changes
        const handleContactChange = (index: number, field: keyof FamilyFriend, value: string) => {
            const updatedContacts = contacts.map((contact, i) =>
                i === index ? { ...contact, [field]: value } : contact
            );
            setContacts(updatedContacts);

            if (onContactsChange) {
                onContactsChange(updatedContacts);
            }

            if (errors[`${field}_${index}`]) {
                setErrors(prev => ({
                    ...prev,
                    [`${field}_${index}`]: ''
                }));
            }
        };

        // Add new contact
        const addNewContact = () => {
            if (!user) {
                Swal.fire({
                    title: 'User Not Found',
                    text: 'Please login to add contacts.',
                    icon: 'warning',
                    confirmButtonColor: '#F59E0B',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const newContact = initialFamilyFriend();
            const updatedContacts = [...contacts, newContact];
            setContacts(updatedContacts);

            if (onContactsChange) {
                onContactsChange(updatedContacts);
            }
        };

        // Remove contact
        const removeContact = async (index: number) => {
            if (contacts.length <= 1) {
                await Swal.fire({
                    title: 'Cannot Remove',
                    text: 'You must have at least one emergency contact.',
                    icon: 'warning',
                    confirmButtonColor: '#F59E0B',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const result = await Swal.fire({
                title: 'Remove Contact',
                text: 'Are you sure you want to remove this contact?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3B82F6',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Yes, remove',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                const updatedContacts = contacts.filter((_, i) => i !== index);
                setContacts(updatedContacts);

                if (onContactsChange) {
                    onContactsChange(updatedContacts);
                }
            }
        };

        // Validate form
        const validateForm = (): boolean => {
            const newErrors: Record<string, string> = {};

            contacts.forEach((contact, index) => {
                if (!contact.name.trim()) {
                    newErrors[`name_${index}`] = 'Name is required';
                }
                if (!contact.relationship.trim()) {
                    newErrors[`relationship_${index}`] = 'Relationship is required';
                }
                if (!contact.phone.trim()) {
                    newErrors[`phone_${index}`] = 'Phone number is required';
                } else if (!/^[6-9]\d{9}$/.test(contact.phone.replace(/\D/g, ''))) {
                    newErrors[`phone_${index}`] = 'Valid 10-digit mobile number is required';
                }
                if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) {
                    newErrors[`email_${index}`] = 'Valid email is required';
                }
            });

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        // Handle save
        const handleSave = async (): Promise<boolean> => {
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

            setLocalIsSaving(true);

            try {
                let result;

                if (onSave) {
                    result = await onSave(contacts);
                } else {
                    result = await defaultSaveContacts(user.id, contacts);
                }

                console.log('✅ FamilyFriends: Save result:', result);

                let success = false;
                let resultData = null;

                if (typeof result === 'boolean') {
                    success = result;
                    resultData = { success, message: success ? 'Saved successfully' : 'Save failed' };
                } else if (typeof result === 'object' && result !== null) {
                    success = result.success === true || result.success === 'true';
                    resultData = result;
                } else {
                    success = false;
                    resultData = { success: false, message: 'Invalid save result' };
                }

                if (success) {
                    setLocalCompleted(true);

                    if (onSaveSuccess && resultData) {
                        onSaveSuccess(resultData);
                    }

                    await Swal.fire({
                        title: '✅ Contacts Saved!',
                        text: 'Your family and friends contacts have been saved successfully.',
                        icon: 'success',
                        confirmButtonColor: '#10B981',
                        confirmButtonText: 'Continue',
                        timer: 3000
                    });

                    return true;
                } else {
                    throw new Error(resultData?.message || 'Save operation failed');
                }
            } catch (error) {
                console.error('❌ FamilyFriends: Save error:', error);

                let errorMessage = 'Failed to save contacts. Please try again.';
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
                setLocalIsSaving(false);
            }
        };

        // Default API save function
        const defaultSaveContacts = async (userId: string, contacts: FamilyFriend[]) => {
            try {
                const formData = new FormData();
                formData.append('userId', userId);
                formData.append('mode', 'family_friends');
                formData.append('contacts', JSON.stringify(contacts));

                const response = await fetch(apiEndpoint || '', {
                    method: 'POST',
                    body: formData,
                });

                const responseText = await response.text();

                if (!response.ok) {
                    throw new Error(`Failed to save contacts: ${response.status} ${responseText}`);
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

        const saving = isSaving || localIsSaving;
        const loading = isLoading;

        return (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                        <Users size={48} className="text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Family & Friends</h3>
                    <p className="text-gray-600 mt-2">Add your emergency contacts and close ones</p>

                    {/* Status Indicators */}
                    <div className="mt-4 space-y-2">
                        {loading && (
                            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span className="text-sm font-medium">Loading contacts...</span>
                            </div>
                        )}
                        
                        {localCompleted && !loading && (
                            <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full">
                                <CheckCircle size={16} className="mr-2" />
                                <span className="text-sm font-medium">Saved to database</span>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading contacts from database...</p>
                        <p className="text-sm text-gray-500 mt-2">User ID: {user?.id}</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {contacts.map((contact, index) => (
                                <div key={contact.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Contact {index + 1}
                                        </h3>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                className="text-red-600 text-sm font-medium hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 flex items-center"
                                                onClick={() => removeContact(index)}
                                                disabled={saving}
                                            >
                                                <X size={14} className="mr-1" />
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`name_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                value={contact.name}
                                                onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                                placeholder="Enter full name"
                                                disabled={saving}
                                            />
                                            {errors[`name_${index}`] && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors[`name_${index}`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Relationship */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Relationship *
                                            </label>
                                            <select
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`relationship_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                value={contact.relationship}
                                                onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                                                disabled={saving}
                                            >
                                                {relationshipOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors[`relationship_${index}`] && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors[`relationship_${index}`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`phone_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                value={contact.phone}
                                                onChange={(e) => handleContactChange(index, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="9876543210"
                                                maxLength={10}
                                                disabled={saving}
                                            />
                                            {errors[`phone_${index}`] && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors[`phone_${index}`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`email_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                value={contact.email}
                                                onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                placeholder="example@email.com"
                                                disabled={saving}
                                            />
                                            {errors[`email_${index}`] && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors[`email_${index}`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Address - Full Width */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address (Optional)
                                            </label>
                                            <textarea
                                                rows={2}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                value={contact.address}
                                                onChange={(e) => handleContactChange(index, 'address', e.target.value)}
                                                placeholder="Enter their complete address"
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add More Contacts Button */}
                            <button
                                type="button"
                                onClick={addNewContact}
                                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 group"
                                disabled={!user || saving}
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                        <Plus size={20} className="text-purple-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-semibold text-gray-900 group-hover:text-purple-700">
                                            Add Another Contact
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Add more family members or friends
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Refresh Contacts Button */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={refreshContacts}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                disabled={loading || !user}
                            >
                                <CheckCircle size={16} className="mr-2" />
                                Refresh from Database
                            </button>
                            <p className="text-sm text-gray-500 mt-2">
                                Click to reload contacts from the database
                            </p>
                        </div>

                        {/* Note */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-start space-x-2">
                                <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-800 font-medium">Important Note</p>
                                    <p className="text-sm text-blue-600">
                                        These contacts will be used as emergency contacts. Please ensure the information is accurate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
);

export default FamilyFriends;