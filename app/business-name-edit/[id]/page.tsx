'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, CheckCircle, Copy, Building2, FileText } from 'lucide-react';
import { API_ENDPOINTS2 } from '@/configs/api';
import Swal from 'sweetalert2';

interface BusinessData {
  business_name?: string;
  legal_business_name?: string;
  kyc_completed?: boolean;
  kyc_status?: string;
}

const BusinessNameEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [formData, setFormData] = useState({
    business_name: '',
    legal_business_name: '',
    kyc_completed: false,
    kyc_status: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_ENDPOINTS2.AUTH.BUSSINESS_FETCH_DATA}?businessId=${businessId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch business data');
        }

        const result = await response.json();

        if (result.success && result.data) {
          const data: BusinessData = result.data;
          
          setFormData({
            business_name: data.business_name || '',
            legal_business_name: data.legal_business_name || data.business_name || '',
            kyc_completed: data.kyc_completed || false,
            kyc_status: data.kyc_status || 'pending'
          });
        }
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business information');
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  // Update legal business name when display name changes (only if KYC completed)
  useEffect(() => {
    if (formData.kyc_completed) {
      setFormData(prev => ({
        ...prev,
        legal_business_name: prev.business_name
      }));
    }
  }, [formData.business_name, formData.kyc_completed]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear success message when user starts typing
    if (success) setSuccess('');
  };

  const handleCopyDisplayName = () => {
    setFormData(prev => ({
      ...prev,
      legal_business_name: prev.business_name
    }));
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Display name copied to legal business name',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleSaveBusinessName = async () => {
    if (!formData.business_name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a business name',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updateData = {
        businessId: businessId,
        business_name: formData.business_name
      };

      console.log('Updating business:', updateData);

      const response = await fetch(API_ENDPOINTS2.AUTH.BUSSINESS_EDIT_PAGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();
      console.log('Update response:', responseData);

      if (responseData.success) {
        // Show success SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'Business name updated successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
        }).then((result) => {
          if (result.isConfirmed) {
            router.back();
          }
        });
        
        // You can also use auto-close with redirect
        // setTimeout(() => {
        //   router.back();
        // }, 2000);
      } else {
        // Show error SweetAlert
        Swal.fire({
          title: 'Error!',
          text: responseData.message || 'Failed to update business name',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#d33',
        });
        setError(responseData.message || 'Failed to update business name');
      }
    } catch (err) {
      console.error('Error:', err);
      // Show network error SweetAlert
      Swal.fire({
        title: 'Network Error!',
        text: 'Please check your connection and try again',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNavigateToKYC = () => {
    Swal.fire({
      title: 'Navigate to KYC?',
      text: 'You will be redirected to complete KYC verification',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, go to KYC',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/kyc/${businessId}`);
      }
    });
  };

  const canEditLegalBusinessName = formData.kyc_completed;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading business information...</p>
        </div>
      </div>
    );
  }

  const getKYCStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header with Light Background */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  Swal.fire({
                    title: 'Are you sure?',
                    text: 'Any unsaved changes will be lost',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, go back',
                    cancelButtonText: 'Cancel'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      router.back();
                    }
                  });
                }}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Name</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Update your business display and legal names
                </p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${getKYCStatusColor(formData.kyc_status)}`}>
              <span className="capitalize">{formData.kyc_status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Old success/error messages removed since we're using SweetAlert */}

        <div className="space-y-6">
          {/* Display Business Name Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-50 p-2 rounded-lg mr-3">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Display Business Name</h2>
                <p className="text-gray-500 text-sm">Name visible to your customers</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Enter your business name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This name will appear on invoices, receipts, and customer communications
                </p>
              </div>
            </div>
          </div>

          {/* Legal Business Name Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 ${canEditLegalBusinessName ? 'bg-green-50' : 'bg-gray-50'}`}>
                <FileText className={`w-5 h-5 ${canEditLegalBusinessName ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Legal Business Name</h2>
                <p className="text-gray-500 text-sm">Official registered business name</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registered Name
                </label>
                
                {canEditLegalBusinessName ? (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.legal_business_name}
                        onChange={(e) => handleInputChange('legal_business_name', e.target.value)}
                        placeholder="Enter legal business name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-12"
                      />
                      <button
                        onClick={handleCopyDisplayName}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        title="Copy from Display Name"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Should match your business registration documents
                    </p>
                    
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">KYC Verified</p>
                          <p className="text-xs text-green-700 mt-1">
                            Legal name automatically updates with display name
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {formData.legal_business_name || 'Not Available'}
                      </p>
                    </div>
                    
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">KYC Verification Required</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Complete KYC to edit legal business name
                          </p>
                          <button
                            onClick={handleNavigateToKYC}
                            className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition"
                          >
                            Update KYC
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => {
                  if (formData.business_name) {
                    Swal.fire({
                      title: 'Are you sure?',
                      text: 'Any unsaved changes will be lost',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#3085d6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Yes, cancel',
                      cancelButtonText: 'Continue editing'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        router.back();
                      }
                    });
                  } else {
                    router.back();
                  }
                }}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveBusinessName}
                disabled={saving || !formData.business_name.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Note: Changes may take a few minutes to reflect across all systems
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact support at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessNameEditPage;