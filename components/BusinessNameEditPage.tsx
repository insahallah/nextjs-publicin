'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Tag,
  DollarSign,
  Users,
  Globe,
  Share,
  Shield,
  Info,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';

interface BusinessNameEditFormProps {
  businessData: any;
  businessId: string;
}

const BusinessNameEditForm: React.FC<BusinessNameEditFormProps> = ({ businessData, businessId }) => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: businessData.name || businessData.business_name || '',
    mobile: businessData.mobile || businessData.contactDetails?.mobile || '',
    address: businessData.address_line || businessData.fullAddress || '',
    timings: businessData.timings || '',
    yearOfEstablishment: businessData.yearOfEstablishment || '',
    categories: businessData.child_category_name || '',
    yearlyTurnover: businessData.yearlyTurnover || '',
    numberOfEmployees: businessData.numberOfEmployees || '',
    website: businessData.website || '',
    socialMedia: businessData.socialMedia || '',
    additionalInfo: businessData.additionalInfo || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to update business data
      const response = await fetch('/api/business/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          ...formData
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.back(); // Or navigate to business profile page
        }, 2000);
      } else {
        throw new Error('Failed to update business data');
      }
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Failed to update business data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleCancel}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 style={styles.title}>Edit Business Profile</h1>
        <div style={styles.businessId}>ID: {businessId}</div>
      </div>

      {success && (
        <div style={styles.successMessage}>
          ✅ Business profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Business Name */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Building size={18} />
            <h3 style={styles.sectionTitle}>Business Information</h3>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="name">
              Business Name *
              <span style={styles.statusBadgeComplete}>Complete</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter business name"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="mobile">
              Contact Number *
              <span style={formData.mobile ? styles.statusBadgeComplete : styles.statusBadgeMissing}>
                {formData.mobile ? 'Complete' : 'Missing'}
              </span>
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter contact number"
              style={styles.input}
            />
          </div>
        </div>

        {/* Address & Location */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <MapPin size={18} />
            <h3 style={styles.sectionTitle}>Address & Location</h3>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="address">
              Business Address
              <span style={formData.address ? styles.statusBadgeComplete : styles.statusBadgeMissing}>
                {formData.address ? 'Complete' : 'Missing'}
              </span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter full address"
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Business Details */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Info size={18} />
            <h3 style={styles.sectionTitle}>Business Details</h3>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="timings">
                <Clock size={16} style={{marginRight: '5px'}} />
                Business Timings
              </label>
              <input
                type="text"
                id="timings"
                name="timings"
                value={formData.timings}
                onChange={handleInputChange}
                placeholder="e.g., 9 AM - 6 PM"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="yearOfEstablishment">
                <Calendar size={16} style={{marginRight: '5px'}} />
                Year of Establishment
              </label>
              <input
                type="number"
                id="yearOfEstablishment"
                name="yearOfEstablishment"
                value={formData.yearOfEstablishment}
                onChange={handleInputChange}
                placeholder="e.g., 2010"
                min="1900"
                max={new Date().getFullYear()}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="yearlyTurnover">
                <DollarSign size={16} style={{marginRight: '5px'}} />
                Yearly Turnover
              </label>
              <input
                type="text"
                id="yearlyTurnover"
                name="yearlyTurnover"
                value={formData.yearlyTurnover}
                onChange={handleInputChange}
                placeholder="e.g., ₹50 Lakh"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="numberOfEmployees">
                <Users size={16} style={{marginRight: '5px'}} />
                Number of Employees
              </label>
              <input
                type="number"
                id="numberOfEmployees"
                name="numberOfEmployees"
                value={formData.numberOfEmployees}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                min="0"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Online Presence */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Globe size={18} />
            <h3 style={styles.sectionTitle}>Online Presence</h3>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="website">
              Website
              <span style={formData.website ? styles.statusBadgeComplete : styles.statusBadgeMissing}>
                {formData.website ? 'Complete' : 'Missing'}
              </span>
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="socialMedia">
              <Share size={16} style={{marginRight: '5px'}} />
              Social Media Links
            </label>
            <input
              type="text"
              id="socialMedia"
              name="socialMedia"
              value={formData.socialMedia}
              onChange={handleInputChange}
              placeholder="Facebook, Instagram, LinkedIn links"
              style={styles.input}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Info size={18} />
            <h3 style={styles.sectionTitle}>Additional Information</h3>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="additionalInfo">
              Additional Business Info
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={4}
              placeholder="Add any additional information about your business..."
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={styles.formActions}>
          <button 
            type="button" 
            style={styles.cancelButton}
            onClick={handleCancel}
            disabled={loading}
          >
            <X size={18} />
            Cancel
          </button>
          <button 
            type="submit" 
            style={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={styles.spinnerSmall}></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Inline CSS styles */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Inline CSS styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as 'wrap',
    gap: '15px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px 12px',
    borderRadius: '5px',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#333',
    flex: 1,
    textAlign: 'center' as 'center',
  },
  businessId: {
    color: '#666',
    fontSize: '14px',
    backgroundColor: '#f0f0f0',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center' as 'center',
    fontSize: '16px',
  },
  form: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    color: '#333',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#333',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '16px',
  },
  statusBadgeComplete: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'normal',
  },
  statusBadgeMissing: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'normal',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box' as 'border-box',
    transition: 'border 0.3s',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box' as 'border-box',
    transition: 'border 0.3s',
    resize: 'vertical' as 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1,
    justifyContent: 'center',
    transition: 'background 0.3s',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1,
    justifyContent: 'center',
    transition: 'background 0.3s',
  },
  spinnerSmall: {
    width: '20px',
    height: '20px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
};

export default BusinessNameEditForm;