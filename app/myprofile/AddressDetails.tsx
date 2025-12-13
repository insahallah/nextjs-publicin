'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Home, Building, MapPin, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS2 } from '@/configs/api';

// TypeScript Interfaces
interface HomeAddress {
    id?: number;
    user_id?: number;
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
    is_active?: number;
    is_primary?: number;
    created_at?: string;
    updated_at?: string;
}

interface User {
    id: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
}


// In AddressDetails.tsx, check the interface:
export interface AddressDetailsProps {
    ref?: React.Ref<AddressDetailsHandle>;
    user: User | null;
    initialAddresses: HomeAddress[];
    isSaving: boolean;
    completed: boolean;
    onSave: (addresses: HomeAddress[]) => Promise<any>;
    onSaveSuccess: (result: any) => void;
    onAddressesChange: (addresses: HomeAddress[]) => void;
    apiEndpoint: string;
}

export interface AddressDetailsHandle {
    handleSave: () => Promise<boolean>;
    getAddresses: () => HomeAddress[];
    validateForm: () => boolean;
    refreshAddresses: () => Promise<void>;
}

// Helper function to ensure exactly 3 addresses exist
const ensureThreeAddresses = (addresses: HomeAddress[], userData: User | null): HomeAddress[] => {
    const defaultUser = {
        full_name: userData?.name || userData?.fullName || '',
        contact_mobile: userData?.phone || userData?.mobile || '',
        email: userData?.email || ''
    };

    // Define the three required address tags
    const requiredTags = ['Home', 'Office', 'Other'];
    const result: HomeAddress[] = [];
    
    // Keep existing addresses (preserve IDs for existing records)
    const existingAddresses = [...addresses];
    
    // For each required tag
    requiredTags.forEach(tag => {
        // Try to find existing address with this tag
        const existingIndex = existingAddresses.findIndex(addr => 
            addr.address_tag.toLowerCase() === tag.toLowerCase()
        );
        
        if (existingIndex !== -1) {
            // Use existing address with its ID
            result.push(existingAddresses[existingIndex]);
            // Remove from existing array to avoid duplicates
            existingAddresses.splice(existingIndex, 1);
        } else {
            // Create new address with default values
            result.push({
                full_name: defaultUser.full_name,
                address_line: '',
                area: '',
                landmark: '',
                contact_mobile: defaultUser.contact_mobile,
                city: '',
                state: '',
                district: '',
                pincode: '',
                landline_std: '',
                landline_number: '',
                email: defaultUser.email,
                address_tag: tag
            });
        }
    });
    
    return result;
};

// Function to fetch addresses from API
const fetchAddressesFromAPI = async (userId: string): Promise<HomeAddress[]> => {
    try {
        const formData = new FormData();
        formData.append('user_id', userId);

        const response = await fetch(API_ENDPOINTS2.AUTH.FETCH_USER_SECTION_DATA_ALL_ADDRESS_FOR_UPDATE, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch addresses: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.home_address) {
            // Transform the data to match our interface
            return result.data.home_address.map((addr: any) => ({
                id: addr.id,
                user_id: addr.user_id,
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
                is_active: addr.is_active,
                is_primary: addr.is_primary,
                created_at: addr.created_at,
                updated_at: addr.updated_at
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

// Default API save function
const defaultSaveAddresses = async (userId: string, addresses: HomeAddress[]) => {
    try {
        // Ensure exactly 3 addresses before saving
        const threeAddresses = ensureThreeAddresses(addresses, { id: userId });

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('mode', 'addresses');
        formData.append('addresses', JSON.stringify(threeAddresses));

        const response = await fetch(API_ENDPOINTS2.AUTH.USERS_PROFILE_UPDATE, {
            method: 'POST',
            body: formData,
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`Server error ${response.status}: ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }

        if (!result) {
            throw new Error('No response received from server');
        }

        const isSuccess = result.success === true ||
            result.success === 'true' ||
            result.message?.toLowerCase().includes('success') ||
            result.inserted_count !== undefined ||
            result.updated_count !== undefined;

        if (!isSuccess) {
            throw new Error(result.message || result.error || 'Save failed');
        }

        return result;

    } catch (error) {
        throw error;
    }
};

const AddressDetails = forwardRef<AddressDetailsHandle, AddressDetailsProps>(
    function AddressDetails({
        user,
        initialAddresses = [],
        isSaving = false,
        completed = false,
        onSave,
        onSaveSuccess,
        onAddressesChange,
        apiEndpoint = ''
    }, ref) {
        // Initialize with exactly 3 addresses
        const [homeAddresses, setHomeAddresses] = useState<HomeAddress[]>([]);
        const [errors, setErrors] = useState<Record<string, string>>({});
        const [localIsSaving, setLocalIsSaving] = useState(false);
        const [localCompleted, setLocalCompleted] = useState(completed);
        const [isLoading, setIsLoading] = useState(false);
        const [hasFetched, setHasFetched] = useState(false);

        // Function to load addresses from API
        const loadAddresses = async () => {
            if (!user?.id) return;

            setIsLoading(true);
            try {
                const addressesFromAPI = await fetchAddressesFromAPI(user.id);
                
                // Merge with initial addresses if provided
                let addressesToUse = addressesFromAPI;
                if (initialAddresses.length > 0 && addressesFromAPI.length === 0) {
                    addressesToUse = initialAddresses;
                }
                
                // Ensure we have exactly 3 addresses
                const threeAddresses = ensureThreeAddresses(addressesToUse, user);
                setHomeAddresses(threeAddresses);
                
                // Notify parent if callback provided
                if (onAddressesChange) {
                    onAddressesChange(threeAddresses);
                }
                
                // Mark as completed if we have addresses with IDs
                const savedAddresses = threeAddresses.filter(addr => addr.id);
                if (savedAddresses.length > 0) {
                    setLocalCompleted(true);
                }
                
                setHasFetched(true);
            } catch (error) {
                console.error('Failed to load addresses:', error);
                // Fallback to initial addresses or create default ones
                const threeAddresses = ensureThreeAddresses(initialAddresses, user);
                setHomeAddresses(threeAddresses);
                
                if (onAddressesChange) {
                    onAddressesChange(threeAddresses);
                }
            } finally {
                setIsLoading(false);
            }
        };

        // Load addresses when component mounts or user changes
        useEffect(() => {
            if (user?.id && !hasFetched) {
                loadAddresses();
            }
        }, [user?.id, hasFetched]);

        // Sync with parent completed prop
        useEffect(() => {
            setLocalCompleted(completed);
        }, [completed]);

        // Sync with parent initialAddresses
        useEffect(() => {
            if (initialAddresses.length > 0 && !hasFetched) {
                const threeAddresses = ensureThreeAddresses(initialAddresses, user);
                setHomeAddresses(threeAddresses);
            }
        }, [initialAddresses, user, hasFetched]);

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            handleSave,
            getAddresses: () => homeAddresses,
            validateForm,
            refreshAddresses: loadAddresses
        }));

        // Handle home address changes
        const handleHomeAddressChange = (index: number, field: keyof HomeAddress, value: string) => {
            const updatedAddresses = homeAddresses.map((addr, i) =>
                i === index ? { ...addr, [field]: value } : addr
            );
            setHomeAddresses(updatedAddresses);

            // Notify parent if callback provided
            if (onAddressesChange) {
                onAddressesChange(updatedAddresses);
            }

            // Clear error for this field
            if (errors[`${field}_${index}`]) {
                setErrors(prev => ({
                    ...prev,
                    [`${field}_${index}`]: ''
                }));
            }
        };

        // Validate form
        const validateForm = (): boolean => {
            const newErrors: Record<string, string> = {};

            homeAddresses.forEach((address, index) => {
                if (!address.full_name.trim()) {
                    newErrors[`full_name_${index}`] = 'Name is required';
                }
                if (!address.address_line.trim()) {
                    newErrors[`address_line_${index}`] = 'Address is required';
                }
                if (!address.city.trim()) {
                    newErrors[`city_${index}`] = 'City is required';
                }
                if (!address.pincode.trim()) {
                    newErrors[`pincode_${index}`] = 'Pincode is required';
                } else if (!/^\d{6}$/.test(address.pincode)) {
                    newErrors[`pincode_${index}`] = 'Pincode must be 6 digits';
                }
                if (address.contact_mobile && !/^[6-9]\d{9}$/.test(address.contact_mobile.replace(/\D/g, ''))) {
                    newErrors[`contact_mobile_${index}`] = 'Mobile number is invalid';
                }
                if (address.email && !/\S+@\S+\.\S+/.test(address.email)) {
                    newErrors[`email_${index}`] = 'Email is invalid';
                }
            });

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        // Handle save - ensures all 3 addresses are saved
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
                    // Ensure exactly 3 addresses before saving
                    const threeAddresses = ensureThreeAddresses(homeAddresses, user);
                    
                    // Use custom save function if provided
                    result = await onSave(threeAddresses);
                    
                    if (typeof result === 'boolean') {
                        if (result === true) {
                            result = {
                                success: true,
                                message: 'Addresses saved successfully'
                            };
                        } else {
                            throw new Error('Save operation returned false');
                        }
                    }
                } else {
                    // Use default API save function
                    result = await defaultSaveAddresses(user.id, homeAddresses);
                }
                
                // Check for success
                if (result && (result.success === true || result.success === 'true')) {
                    setLocalCompleted(true);
                    
                    // Refresh addresses from API after successful save
                    await loadAddresses();
                    
                    if (onSaveSuccess) {
                        onSaveSuccess(result);
                    }
                    
                    // Count how many addresses were filled
                    const filledAddresses = homeAddresses.filter(addr => 
                        addr.full_name.trim() && 
                        addr.address_line.trim() && 
                        addr.city.trim() && 
                        addr.pincode.trim()
                    ).length;
                    
                    await Swal.fire({
                        title: '✅ Addresses Saved!',
                        html: `
                            <div class="text-center">
                                <div class="mb-4">
                                    <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-bold text-gray-700 mb-2">Success!</h4>
                                <p class="text-gray-600">
                                    ${filledAddresses} out of 3 addresses have been saved to database.<br/>
                                    <span class="text-sm text-gray-500">(Home, Office, and Other addresses)</span>
                                </p>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonColor: '#10B981',
                        confirmButtonText: 'Continue',
                        timer: 3000
                    });
                    
                    return true;
                } else {
                    throw new Error(result?.message || result?.error || 'Save operation failed');
                }
            } catch (error) {
                let errorMessage = 'Failed to save addresses. Please try again.';
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

        // Address tag icon
        const getAddressTagIcon = (tag: string) => {
            switch (tag.toLowerCase()) {
                case 'home': return <Home size={16} className="text-blue-600" />;
                case 'office': return <Building size={16} className="text-green-600" />;
                default: return <MapPin size={16} className="text-purple-600" />;
            }
        };

        // Check if address is already saved in database (has an ID)
        const isAddressSaved = (address: HomeAddress): boolean => {
            return !!address.id;
        };

        const saving = isSaving || localIsSaving;

        // Show loading state
        if (isLoading) {
            return (
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Home size={48} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Address Details</h3>
                        <p className="text-gray-600 mt-2">Loading your addresses...</p>
                        
                        <div className="mt-8 flex justify-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Home size={48} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Address Details</h3>
                    <p className="text-gray-600 mt-2">Manage your Home, Office, and Other addresses</p>

                    {/* Database Status and Refresh Button */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                            <CheckCircle size={16} className="mr-2" />
                            <span className="text-sm font-medium">
                                {homeAddresses.filter(addr => addr.id).length} saved addresses
                            </span>
                        </div>
                        
                        <button
                            onClick={loadAddresses}
                            disabled={saving || isLoading}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            <span className="text-sm">Refresh</span>
                        </button>
                    </div>

                    {/* Save Status Indicator */}
                    {localCompleted && (
                        <div className="mt-4 inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full">
                            <CheckCircle size={16} className="mr-2" />
                            <span className="text-sm font-medium">Addresses saved to database</span>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {homeAddresses.map((address, index) => (
                        <div key={`${address.address_tag}_${index}`} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    {getAddressTagIcon(address.address_tag)}
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {address.address_tag} Address
                                    </h3>
                                    
                                    {/* Show saved indicator if address has ID from database */}
                                    {isAddressSaved(address) && (
                                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded flex items-center">
                                            <CheckCircle size={12} className="mr-1" />
                                            Saved in Database
                                        </span>
                                    )}
                                    
                                    {/* Show required indicator only if not saved */}
                                    {!isAddressSaved(address) && (
                                        <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                            New Address Required
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`full_name_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            value={address.full_name}
                                            onChange={(e) => handleHomeAddressChange(index, 'full_name', e.target.value)}
                                            placeholder="Enter full name"
                                            disabled={saving}
                                        />
                                        {errors[`full_name_${index}`] && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle size={14} className="mr-1" />
                                                {errors[`full_name_${index}`]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address *
                                        </label>
                                        <textarea
                                            rows={3}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors[`address_line_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            value={address.address_line}
                                            onChange={(e) => handleHomeAddressChange(index, 'address_line', e.target.value)}
                                            placeholder="Enter complete address"
                                            disabled={saving}
                                        />
                                        {errors[`address_line_${index}`] && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle size={14} className="mr-1" />
                                                {errors[`address_line_${index}`]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Area (Village/Town)
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={address.area}
                                            onChange={(e) => handleHomeAddressChange(index, 'area', e.target.value)}
                                            placeholder="Enter area, village or town"
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Landmark
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={address.landmark}
                                            onChange={(e) => handleHomeAddressChange(index, 'landmark', e.target.value)}
                                            placeholder="Enter nearby landmark"
                                            disabled={saving}
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Number
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`contact_mobile_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            value={address.contact_mobile}
                                            onChange={(e) => handleHomeAddressChange(index, 'contact_mobile', e.target.value)}
                                            placeholder="Enter mobile number"
                                            maxLength={10}
                                            disabled={saving}
                                        />
                                        {errors[`contact_mobile_${index}`] && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle size={14} className="mr-1" />
                                                {errors[`contact_mobile_${index}`]}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`city_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                value={address.city}
                                                onChange={(e) => handleHomeAddressChange(index, 'city', e.target.value)}
                                                placeholder="Enter city"
                                                disabled={saving}
                                            />
                                            {errors[`city_${index}`] && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors[`city_${index}`]}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                District
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={address.district}
                                                onChange={(e) => handleHomeAddressChange(index, 'district', e.target.value)}
                                                placeholder="Enter district"
                                                disabled={saving}
                                        />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={address.state}
                                                onChange={(e) => handleHomeAddressChange(index, 'state', e.target.value)}
                                                placeholder="Enter state"
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`pincode_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            value={address.pincode}
                                            onChange={(e) => handleHomeAddressChange(index, 'pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="6-digit pincode"
                                            maxLength={6}
                                            disabled={saving}
                                        />
                                        {errors[`pincode_${index}`] && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle size={14} className="mr-1" />
                                                {errors[`pincode_${index}`]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Landline Number
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={address.landline_std}
                                                onChange={(e) => handleHomeAddressChange(index, 'landline_std', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="STD"
                                                disabled={saving}
                                            />
                                            <input
                                                type="text"
                                                className="col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={address.landline_number}
                                                onChange={(e) => handleHomeAddressChange(index, 'landline_number', e.target.value)}
                                                placeholder="Landline number"
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email ID
                                            </label>
                                            <input
                                                type="email"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`email_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                value={address.email}
                                                onChange={(e) => handleHomeAddressChange(index, 'email', e.target.value)}
                                                placeholder="your@email.com"
                                                disabled={saving}
                                            />
                                            {errors[`email_${index}`] && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors[`email_${index}`]}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address Type
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                                value={address.address_tag}
                                                readOnly
                                                disabled
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Type: {address.address_tag}
                                                {isAddressSaved(address) && ' (From Database)'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Information box */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Address Information
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p className="mb-2">
                                        <strong>Database Status:</strong> Fetched {homeAddresses.filter(addr => addr.id).length} addresses from database.
                                    </p>
                                    <ul className="list-disc ml-5 space-y-1">
                                        <li><span className="font-medium">Home Address</span> - Your residential address</li>
                                        <li><span className="font-medium">Office Address</span> - Your workplace address</li>
                                        <li><span className="font-medium">Other Address</span> - Any additional address</li>
                                    </ul>
                                    <p className="mt-3">
                                        <strong>Note:</strong> All 3 address types will be saved when you click "Save & Continue".
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

export default AddressDetails;