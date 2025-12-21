'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MessageCircle, AlertCircle, HelpCircle, X, User, Globe, Shield, Check, ChevronDown } from 'lucide-react';
import { API_ENDPOINTS2 } from '@/configs/api';

interface ContactPerson {
    id: number;
    title: string;
    name: string;
    designation: string;
    mobileNumber: string;
    mobileCountryCode: string;
    mobileIsPrimary: boolean;
    mobileReceivesCalls: boolean;
    mobileReceivesNotifications: boolean;
}

interface ContactNumber {
    id: number;
    type: 'mobile' | 'whatsapp' | 'landline' | 'toll-free';
    countryCode: string;
    number: string;
    isPrimary: boolean;
    receivesCalls: boolean;
    receivesNotifications: boolean;
}

interface Email {
    id: number;
    email: string;
    receivesNotifications: boolean;
}

interface ApiContactData {
    id: number;
    title: string;
    contact_persons_name: string;
    designation: string;
    contact_person_mobile_num: string;
    contact_person_whatsapp_num: string;
    email_id: string;
    post_id: number;
    user_id: number;
    is_primary?: any;
    receive_customer_calls?: any;
    receive_app_notifications?: any;
    whatsapp_receives_notifications?: any;
}

const BusinessContactEditPage = () => {
    const router = useRouter();
    const params = useParams();
    const businessId = params.id as string;
    const [field, setField] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
    const [whatsappNumbers, setWhatsappNumbers] = useState<ContactNumber[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [landlineNumbers, setLandlineNumbers] = useState<ContactNumber[]>([]);
    const [tollFreeNumbers, setTollFreeNumbers] = useState<ContactNumber[]>([]);
    const [sameAsMobile, setSameAsMobile] = useState(false);

    const [showEmailPopup, setShowEmailPopup] = useState(false);
    const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
    const [showBackupPopup, setShowBackupPopup] = useState(false);

    const titles = ['Mr', 'Mrs', 'Dr', 'Ms', 'Dt', 'O.D'];
    const designations = [
        'Assistant Branch Manager', 'Assistant General Manager', 'Assistant Manager',
        'Assistant Professor', 'Assistant Regional Manager', 'Associate Professor',
        'Branch Manager', 'Business Development Manager', 'Chairman', 'Chairperson',
        'Chief Executive Officer', 'Chief Medical Officer', 'Chief Operating Officer',
        'Chief Technology Officer', 'Consultant', 'Director', 'Freelancer',
        'General Manager', 'HR Manager', 'IT Manager', 'Lecturer', 'Manager',
        'Managing Director', 'Marketing Manager', 'Operations Manager', 'Partner',
        'President', 'Principal', 'Professor', 'Proprietor', 'Regional Manager',
        'Sales Manager', 'Senior Manager', 'Store Manager', 'Superintendent',
        'Vice President', 'Vice Principal', 'Zonal Manager'
    ];

    // Function to convert various formats to boolean
    const stringToBoolean = (value: any): boolean => {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        
        if (typeof value === 'boolean') {
            return value;
        }
        
        if (typeof value === 'string') {
            const trimmed = value.trim().toLowerCase();
            if (trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === 'on') {
                return true;
            }
            if (trimmed === 'false' || trimmed === '0' || trimmed === 'no' || trimmed === 'off') {
                return false;
            }
        }
        
        if (typeof value === 'number') {
            return value === 1;
        }
        
        return Boolean(value);
    };

    // Fetch business contact data
    useEffect(() => {
        const fetchBusinessContactData = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(
                    `${API_ENDPOINTS2.AUTH.BUSSINESS_CONTACT_FETCH_FOR_DISPLAY}?businessId=${businessId}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch business data: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && result.data) {
                    const data = result.data;

                    // Extract contact details from API response
                    const contactDetails: ApiContactData[] = data.contact_details || [];

                    if (contactDetails.length > 0) {
                        // Map API data to contact persons with mobile numbers
                        const persons = contactDetails.map((item, index) => {
                            // Convert boolean values
                            const isPrimary = stringToBoolean(item.is_primary);
                            const receivesCalls = stringToBoolean(item.receive_customer_calls);
                            const receivesNotifications = stringToBoolean(item.receive_app_notifications);

                            return {
                                id: item.id || index + 1,
                                title: item.title || 'Mr',
                                name: item.contact_persons_name || '',
                                designation: item.designation || '',
                                mobileNumber: item.contact_person_mobile_num || '',
                                mobileCountryCode: '+91',
                                mobileIsPrimary: isPrimary,
                                mobileReceivesCalls: receivesCalls,
                                mobileReceivesNotifications: receivesNotifications
                            };
                        });
                        
                        setContactPersons(persons);

                        // Map API data to WhatsApp numbers
                        const whatsapps = contactDetails.map((item, index) => {
                            const receivesNotifications = stringToBoolean(item.whatsapp_receives_notifications);

                            return {
                                id: item.id || index + 1,
                                type: 'whatsapp' as const,
                                countryCode: '+91',
                                number: item.contact_person_whatsapp_num || '',
                                isPrimary: false,
                                receivesCalls: false,
                                receivesNotifications: receivesNotifications
                            };
                        });
                        setWhatsappNumbers(whatsapps);

                        // Map API data to emails
                        const emailList = contactDetails.map((item, index) => ({
                            id: item.id || index + 1,
                            email: item.email_id || '',
                            receivesNotifications: true // Default value
                        }));
                        setEmails(emailList);

                        // Check if mobile and WhatsApp numbers are same for first contact
                        const firstContact = contactDetails[0];
                        if (firstContact && 
                            firstContact.contact_person_mobile_num && 
                            firstContact.contact_person_whatsapp_num &&
                            firstContact.contact_person_mobile_num === firstContact.contact_person_whatsapp_num) {
                            setSameAsMobile(true);
                        }
                    } else {
                        // If no data, set defaults
                        setContactPersons([{
                            id: 1,
                            title: 'Mr',
                            name: '',
                            designation: '',
                            mobileNumber: '',
                            mobileCountryCode: '+91',
                            mobileIsPrimary: true,
                            mobileReceivesCalls: true,
                            mobileReceivesNotifications: true
                        }]);
                        setWhatsappNumbers([{ 
                            id: 1, 
                            type: 'whatsapp', 
                            countryCode: '+91', 
                            number: '', 
                            isPrimary: false, 
                            receivesCalls: false, 
                            receivesNotifications: false 
                        }]);
                        setEmails([{ 
                            id: 1, 
                            email: '', 
                            receivesNotifications: true 
                        }]);
                    }
                } else {
                    setError(result.message || 'Failed to load contact details');
                }
            } catch (err: any) {
                setError(`Failed to load business information: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (businessId) {
            fetchBusinessContactData();
        }
    }, [businessId]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setField(urlParams.get('field') || '');
    }, []);

    useEffect(() => {
        if (sameAsMobile && contactPersons[0] && whatsappNumbers[0]) {
            setWhatsappNumbers([{
                ...whatsappNumbers[0],
                countryCode: contactPersons[0]?.mobileCountryCode || '+91',
                number: contactPersons[0]?.mobileNumber || ''
            }]);
        }
    }, [contactPersons[0]?.mobileNumber, sameAsMobile]);

    const handleBack = () => {
        router.back();
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccessMessage('');
            
            // Prepare data for UPDATE
            const contactData = contactPersons.map((person, index) => {
                // Get corresponding WhatsApp and email data
                const whatsappData = whatsappNumbers[index] || whatsappNumbers[0];
                const emailData = emails[index] || emails[0];
                
                return {
                    title: person.title,
                    contact_persons_name: person.name,
                    designation: person.designation,
                    contact_person_mobile_num: person.mobileNumber || '',
                    contact_person_whatsapp_num: sameAsMobile ? 
                        person.mobileNumber : 
                        (whatsappData?.number || ''),
                    email_id: emailData?.email || '',
                    user_id: 3, // TODO: Replace with actual user ID from authentication/session
                    // Add new fields for true/false values
                    is_primary: person.mobileIsPrimary,
                    receives_calls: person.mobileReceivesCalls,
                    receives_notifications: person.mobileReceivesNotifications,
                    whatsapp_receives_notifications: whatsappData?.receivesNotifications || false
                };
            });

            // Send UPDATE request
            const response = await fetch(API_ENDPOINTS2.AUTH.BUSSINESS_CONTACT_UPDATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: businessId,
                    contactData: contactData
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMessage(result.message || 'Contact details updated successfully!');
                
                // Clear success message after 3 seconds and redirect
                setTimeout(() => {
                    setSuccessMessage('');
                    router.back();
                }, 3000);
            } else {
                // Show specific error messages
                const errorMsg = result.message || 'Failed to update contact details';
                const warnings = result.warnings ? ` Warnings: ${result.warnings.join(', ')}` : '';
                throw new Error(errorMsg + warnings);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update contact information. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const addContactPerson = () => {
        const newId = contactPersons.length > 0 ? Math.max(...contactPersons.map(cp => cp.id)) + 1 : 1;
        setContactPersons([...contactPersons, {
            id: newId,
            title: 'Mr',
            name: '',
            designation: '',
            mobileNumber: '',
            mobileCountryCode: '+91',
            mobileIsPrimary: false,
            mobileReceivesCalls: true,
            mobileReceivesNotifications: true
        }]);

        // Also add corresponding WhatsApp and email entries
        const whatsappNewId = whatsappNumbers.length > 0 ? Math.max(...whatsappNumbers.map(w => w.id)) + 1 : 1;
        setWhatsappNumbers([...whatsappNumbers, {
            id: whatsappNewId,
            type: 'whatsapp',
            countryCode: '+91',
            number: '',
            isPrimary: false,
            receivesCalls: false,
            receivesNotifications: false
        }]);

        const emailNewId = emails.length > 0 ? Math.max(...emails.map(e => e.id)) + 1 : 1;
        setEmails([...emails, { id: emailNewId, email: '', receivesNotifications: true }]);
    };

    const removeContactPerson = (id: number) => {
        if (contactPersons.length > 1) {
            setContactPersons(contactPersons.filter(cp => cp.id !== id));
            // Also remove corresponding entries
            setWhatsappNumbers(whatsappNumbers.filter(num => num.id !== id));
            setEmails(emails.filter(e => e.id !== id));
        }
    };

    const updateContactPerson = (id: number, field: keyof ContactPerson, value: any) => {
        if (field === 'mobileIsPrimary' && value === true) {
            setContactPersons(contactPersons.map(person => ({
                ...person,
                mobileIsPrimary: person.id === id
            })));
        } else {
            setContactPersons(contactPersons.map(person =>
                person.id === id ? { ...person, [field]: value } : person
            ));
        }
    };

    const updateWhatsappNumber = (id: number, field: keyof ContactNumber, value: any) => {
        setWhatsappNumbers(whatsappNumbers.map(num =>
            num.id === id ? { ...num, [field]: value } : num
        ));
    };

    const addEmail = () => {
        const newId = emails.length > 0 ? Math.max(...emails.map(e => e.id)) + 1 : 1;
        setEmails([...emails, { id: newId, email: '', receivesNotifications: true }]);
    };

    const removeEmail = (id: number) => {
        if (emails.length > 1) {
            setEmails(emails.filter(e => e.id !== id));
        }
    };

    const addLandlineNumber = () => {
        const newId = landlineNumbers.length > 0 ? Math.max(...landlineNumbers.map(l => l.id)) + 1 : 1;
        setLandlineNumbers([...landlineNumbers, {
            id: newId,
            type: 'landline',
            countryCode: '+91',
            number: '',
            isPrimary: false,
            receivesCalls: true,
            receivesNotifications: false
        }]);
    };

    const addTollFreeNumber = () => {
        const newId = tollFreeNumbers.length > 0 ? Math.max(...tollFreeNumbers.map(t => t.id)) + 1 : 1;
        setTollFreeNumbers([...tollFreeNumbers, {
            id: newId,
            type: 'toll-free',
            countryCode: '+91',
            number: '',
            isPrimary: false,
            receivesCalls: true,
            receivesNotifications: false
        }]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Loading contact details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <AlertCircle size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={handleBack}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="mx-auto max-w-4xl px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            <span className="font-medium text-sm sm:text-base">Back</span>
                        </button>

                        <div className="flex-1 text-center px-4">
                            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Contact Details</h1>
                        </div>

                        <div className="w-16 sm:w-20"></div>
                    </div>
                </div>
            </header>

            <main className="pb-24 mx-auto max-w-4xl px-4">
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <Check size={20} className="text-green-600 mr-3" />
                            <p className="text-green-700 text-sm">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <AlertCircle size={20} className="text-red-600 mr-3" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-lg mt-4 p-4">
                    <div className="flex items-start">
                        <AlertCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-gray-700">
                            Update your contact details to stay in touch with your customers in real time
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-8">
                    {/* Contact Persons with Mobile Numbers Section */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <User size={18} className="mr-2 text-blue-600" />
                                Contact Persons & Mobile Numbers
                            </h2>

                            <div className="space-y-6">
                                {contactPersons.map((person) => (
                                    <div key={person.id} className="bg-gray-50 rounded-lg p-4 relative border border-gray-200">
                                        {contactPersons.length > 1 && (
                                            <button
                                                onClick={() => removeContactPerson(person.id)}
                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}

                                        {/* Contact Person Details */}
                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                <User size={14} className="mr-2" />
                                                Contact Person {contactPersons.length > 1 ? person.id : ''}
                                            </h3>

                                            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
                                                <div className="w-full sm:w-32">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Title
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={person.title}
                                                            onChange={(e) => updateContactPerson(person.id, 'title', e.target.value)}
                                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white appearance-none"
                                                        >
                                                            {titles.map(title => (
                                                                <option key={title} value={title}>{title}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={person.name}
                                                            onChange={(e) => updateContactPerson(person.id, 'name', e.target.value)}
                                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm peer"
                                                            placeholder=" "
                                                        />
                                                        <label className="absolute left-3 -top-2.5 bg-gray-50 px-1 text-xs font-medium text-gray-700 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent transition-all duration-200 pointer-events-none">
                                                            Contact Person Name
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Designation
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={person.designation}
                                                        onChange={(e) => updateContactPerson(person.id, 'designation', e.target.value)}
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white appearance-none"
                                                    >
                                                        <option value="">Select Designation</option>
                                                        {designations.map(designation => (
                                                            <option key={designation} value={designation}>{designation}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Number for this Contact Person */}
                                        <div className="pt-4 border-t border-gray-300">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                <Phone size={14} className="mr-2 text-green-600" />
                                                Mobile Number
                                            </h3>

                                            <div className="mb-4">
                                                <div className="flex gap-3 items-center">
                                                    <div className="min-w-[90px] border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 bg-white">
                                                        <div className="relative w-5 h-5">
                                                            <svg width="20" height="15" viewBox="0 0 900 600" fill="none">
                                                                <rect width="900" height="600" fill="#F93" />
                                                                <rect y="200" width="900" height="200" fill="#FFF" />
                                                                <rect y="400" width="900" height="200" fill="#128807" />
                                                                <circle cx="450" cy="300" r="90" fill="#000080" />
                                                                <circle cx="450" cy="300" r="80" fill="#FFF" />
                                                                <circle cx="450" cy="300" r="70" fill="#000080" />
                                                                <g fill="#FFF">
                                                                    <circle cx="450" cy="300" r="3" />
                                                                    {[...Array(24)].map((_, i) => {
                                                                        const angle = (i * 15) * Math.PI / 180;
                                                                        const x = 450 + 60 * Math.cos(angle);
                                                                        const y = 300 + 60 * Math.sin(angle);
                                                                        return <circle key={i} cx={x} cy={y} r="3" />;
                                                                    })}
                                                                </g>
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium">{person.mobileCountryCode}</span>
                                                    </div>

                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="tel"
                                                            value={person.mobileNumber}
                                                            onChange={(e) => updateContactPerson(person.id, 'mobileNumber', e.target.value)}
                                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm peer bg-gray-50"
                                                            placeholder=" "
                                                            maxLength={10}
                                                        />
                                                        <label className="absolute left-3 -top-2.5 bg-gray-50 px-1 text-xs font-medium text-gray-700 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent transition-all duration-200 pointer-events-none">
                                                            Mobile Number
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <label className="flex items-start space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={person.mobileIsPrimary}
                                                        onChange={(e) => updateContactPerson(person.id, 'mobileIsPrimary', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                                                    />
                                                    <span className="text-xs sm:text-sm text-gray-700">
                                                        प्राइमरी नंबर सेट करें
                                                        <span className="ml-1 group relative inline-block">
                                                            <HelpCircle size={12} className="inline text-gray-400" />
                                                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-20 shadow-lg">
                                                                A primary number connects directly to your business. All approvals for updating information on your business listing will be sent to the primary number
                                                            </div>
                                                        </span>
                                                    </span>
                                                </label>

                                                <label className="flex items-start space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={person.mobileReceivesCalls}
                                                        onChange={(e) => updateContactPerson(person.id, 'mobileReceivesCalls', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                                                    />
                                                    <span className="text-xs sm:text-sm text-gray-700">ग्राहक कॉल प्राप्त करें</span>
                                                </label>

                                                <label className="flex items-start space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={person.mobileReceivesNotifications}
                                                        onChange={(e) => updateContactPerson(person.id, 'mobileReceivesNotifications', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                                                    />
                                                    <span className="text-xs sm:text-sm text-gray-700">ऐप नोटिफिकेशन प्राप्त करें</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mt-4">
                                <div className="flex items-start">
                                    <div className="bg-yellow-100 p-2 rounded-full mr-3">
                                        <Shield size={16} className="text-yellow-600" />
                                    </div>
                                    <p className="text-xs text-gray-700">
                                        Add Backup Contact Person with Mobile Number to Avoid Losing Customers if One Person is Not Reachable
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={addContactPerson}
                                className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                            >
                                <span className="mr-1 text-lg">+</span>
                                Add Another Contact Person with Mobile Number
                            </button>
                        </div>
                    </div>

                    {/* WhatsApp Numbers Section */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="mr-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                                    </svg>
                                </div>
                                WhatsApp Numbers
                            </h2>

                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                                <div className="flex items-start">
                                    <div className="bg-green-100 p-2 rounded-full mr-3">
                                        <MessageCircle size={16} className="text-green-600" />
                                    </div>
                                    <p className="text-xs text-gray-700">
                                        Add a WhatsApp Number to Enable Chat Option on Your Business Profile Listing Page
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {whatsappNumbers.map((number, index) => (
                                    <div key={number.id} className="bg-gray-50 rounded-lg p-4 relative">
                                        <div className="mb-3">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={sameAsMobile}
                                                        onChange={(e) => {
                                                            setSameAsMobile(e.target.checked);
                                                            if (e.target.checked && contactPersons[index]) {
                                                                updateWhatsappNumber(number.id, 'number', contactPersons[index]?.mobileNumber || '');
                                                            }
                                                        }}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 border rounded flex items-center justify-center ${sameAsMobile ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                        {sameAsMobile && <Check size={14} className="text-white" />}
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Same as Mobile Number</span>
                                            </label>
                                        </div>

                                        <div>
                                            <div className="flex gap-3 items-center">
                                                <div className="min-w-[90px] border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 bg-white">
                                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium">+91</span>
                                                </div>

                                                <div className="flex-1 relative">
                                                    <input
                                                        type="tel"
                                                        value={number.number}
                                                        onChange={(e) => updateWhatsappNumber(number.id, 'number', e.target.value)}
                                                        className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm peer ${sameAsMobile ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                                                        placeholder=" "
                                                        maxLength={10}
                                                        disabled={sameAsMobile}
                                                    />
                                                    <label className="absolute left-3 -top-2.5 bg-gray-50 px-1 text-xs font-medium text-gray-700 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent transition-all duration-200 pointer-events-none">
                                                        WhatsApp Number
                                                    </label>
                                                </div>
                                            </div>

                                            {sameAsMobile && (
                                                <div className="text-xs text-blue-600 mt-2 italic">
                                                    Uncheck "Same as Mobile" to edit WhatsApp number separately
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!sameAsMobile && (
                                <button
                                    onClick={() => {
                                        const newId = whatsappNumbers.length > 0 ? Math.max(...whatsappNumbers.map(w => w.id)) + 1 : 1;
                                        setWhatsappNumbers([...whatsappNumbers, {
                                            id: newId,
                                            type: 'whatsapp',
                                            countryCode: '+91',
                                            number: '',
                                            isPrimary: false,
                                            receivesCalls: false,
                                            receivesNotifications: false
                                        }]);
                                    }}
                                    className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                                >
                                    <span className="mr-1 text-lg">+</span>
                                    Add Another WhatsApp Number
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Email Address Section */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Mail size={18} className="mr-2 text-purple-600" />
                                Email Address
                            </h2>

                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
                                <div className="flex items-start">
                                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                                        <Globe size={16} className="text-purple-600" />
                                    </div>
                                    <p className="text-xs text-gray-700">
                                        Add Email to Your Business Profile Listing to Get <span className="font-bold">2x</span> More Leads
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {emails.map((email) => (
                                    <div key={email.id} className="bg-gray-50 rounded-lg p-4 relative">
                                        {emails.length > 1 && (
                                            <button
                                                onClick={() => removeEmail(email.id)}
                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="email"
                                                    value={email.email}
                                                    onChange={(e) => {
                                                        const newEmails = [...emails];
                                                        const index = newEmails.findIndex(e => e.id === email.id);
                                                        if (index >= 0) {
                                                            newEmails[index].email = e.target.value;
                                                            setEmails(newEmails);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm peer bg-gray-50"
                                                    placeholder=" "
                                                />
                                                <label className="absolute left-3 -top-2.5 bg-gray-50 px-1 text-xs font-medium text-gray-700 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent transition-all duration-200 pointer-events-none">
                                                    Email Address
                                                </label>
                                            </div>

                                            <label className="flex items-center space-x-2 whitespace-nowrap cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={email.receivesNotifications}
                                                        onChange={(e) => {
                                                            const newEmails = [...emails];
                                                            const index = newEmails.findIndex(em => em.id === email.id);
                                                            if (index >= 0) {
                                                                newEmails[index].receivesNotifications = e.target.checked;
                                                                setEmails(newEmails);
                                                            }
                                                        }}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 border rounded flex items-center justify-center ${email.receivesNotifications ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                        {email.receivesNotifications && <Check size={14} className="text-white" />}
                                                    </div>
                                                </div>
                                                <span className="text-xs sm:text-sm text-gray-700">Receive Notifications</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addEmail}
                                className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                            >
                                <span className="mr-1 text-lg">+</span>
                                Add Another Email
                            </button>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <button
                                    onClick={addLandlineNumber}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center">
                                        <Phone size={18} className="mr-3 text-gray-600 group-hover:text-blue-600" />
                                        <span className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-blue-600">Add Landline Number</span>
                                    </div>
                                    <span className="text-lg text-blue-600 group-hover:text-blue-700">+</span>
                                </button>

                                <button
                                    onClick={addTollFreeNumber}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center">
                                        <Phone size={18} className="mr-3 text-gray-600 group-hover:text-blue-600" />
                                        <span className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-blue-600">Add Toll-Free Number</span>
                                    </div>
                                    <span className="text-lg text-blue-600 group-hover:text-blue-700">+</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="mx-auto max-w-4xl px-4 py-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full font-medium py-3.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base shadow-md ${saving
                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {saving ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                Saving...
                            </div>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>

            {/* Popup Modals */}
            {showEmailPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm mx-auto">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">IMPORTANT - Email ID Missing</h3>
                                <button onClick={() => setShowEmailPopup(false)} className="hover:bg-gray-100 p-1 rounded">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700 text-xs sm:text-sm">
                                Email ID is required to receive instant alerts, customised leads and the latest information on new feature releases
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowEmailPopup(false)}
                                className="flex-1 border border-blue-600 text-blue-600 font-medium py-2.5 px-4 rounded-lg hover:bg-blue-50 text-sm sm:text-base"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    setShowEmailPopup(false);
                                }}
                                className="flex-1 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                            >
                                Add Email Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showWhatsappPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm mx-auto">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">IMPORTANT - WhatsApp No. Missing</h3>
                                <button onClick={() => setShowWhatsappPopup(false)} className="hover:bg-gray-100 p-1 rounded">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700 text-xs sm:text-sm">
                                Add WhatsApp number to ensure customers can reach you when phone lines are busy.
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowWhatsappPopup(false)}
                                className="flex-1 border border-blue-600 text-blue-600 font-medium py-2.5 px-4 rounded-lg hover:bg-blue-50 text-sm sm:text-base"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    setShowWhatsappPopup(false);
                                }}
                                className="flex-1 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                            >
                                Add WhatsApp Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBackupPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm mx-auto">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">IMP - Backup Mobile Number Missing</h3>
                                <button onClick={() => setShowBackupPopup(false)} className="hover:bg-gray-100 p-1 rounded">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700 text-xs sm:text-sm">
                                Add backup mobile number to avoid losing customers if one number is not reachable.
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowBackupPopup(false)}
                                className="flex-1 border border-blue-600 text-blue-600 font-medium py-2.5 px-4 rounded-lg hover:bg-blue-50 text-sm sm:text-base"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    setShowBackupPopup(false);
                                }}
                                className="flex-1 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                            >
                                Add Mobile Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessContactEditPage;