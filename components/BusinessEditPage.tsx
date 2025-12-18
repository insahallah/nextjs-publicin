'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './css/BusinessEditPage.css';
import { API_ENDPOINTS2 } from '@/configs/api';

// Import icons
import { 
  ArrowRight,
  Edit,
  Megaphone,
  MessageSquare,
  Camera,
  Phone,
  Mail,
  MessageCircle,
  Upload,
  Gift,
  Globe,
  Video,
  Share2,
  QrCode,
  X,
  Building,
  MapPin,
  Clock,
  Calendar,
  Tag,
  DollarSign,
  Users,
  Link,
  Share,
  Shield,
  Info
} from 'lucide-react';

interface BusinessEditPageProps {
  businessId: string;
}

interface BusinessData {
  id: string;
  name: string;
  location: string;
  profileScore: number;
  reviewsCount: number;
  addContactCount: number;
  contactDetails?: string;
  address?: string;
  timings?: string;
  categories?: string;
  yearlyTurnover?: string;
  numberOfEmployees?: string;
  yearOfEstablishment?: string;
  website?: string;
  socialMedia?: string;
  kycStatus?: string;
  additionalInfo?: string;
}

const BusinessEditPage: React.FC<BusinessEditPageProps> = ({ businessId }) => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [business, setBusiness] = useState<BusinessData>({
    id: businessId,
    name: '',
    location: '',
    profileScore: 0,
    reviewsCount: 0,
    addContactCount: 0,
  });

  // Fetch business data on component mount
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for business ID:', businessId);
        
        const apiUrl = `${API_ENDPOINTS2.AUTH.DISPLAY_PROFILE_DATA_FOR_RIGHTMODLE}?businessId=${businessId}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch business data: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Business data received:', result);
        
        if (result.success && result.data) {
          const apiData = result.data;
          setBusiness({
            id: apiData.id?.toString() || businessId,
            name: apiData.name || apiData.business_name || 'N/A',
            location: apiData.location || 
                     `${apiData.district_name || ''}, ${apiData.block_name || ''}`.trim() || 'N/A',
            profileScore: apiData.profileScore || calculateProfileScore(apiData) || 0,
            reviewsCount: apiData.reviewsCount || 0,
            addContactCount: apiData.addContactCount || 0,
            contactDetails: apiData.contactDetails?.mobile || apiData.mobile || '',
            address: apiData.address?.fullAddress || apiData.address_line || apiData.fullAddress || '',
            timings: apiData.timings || 'Not available',
            categories: apiData.categories?.sub || apiData.child_category_name || '',
            yearlyTurnover: apiData.yearlyTurnover || 'Not added',
            numberOfEmployees: apiData.numberOfEmployees || 'Not added',
            yearOfEstablishment: apiData.yearOfEstablishment || 'Not added',
            website: apiData.website || 'Not added',
            socialMedia: apiData.socialMedia || 'Not added',
            kycStatus: apiData.kycStatus || 'Missing',
            additionalInfo: apiData.additionalInfo || 'Info Missing',
          });
        } else {
          throw new Error(result.error || 'Failed to load business data');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load business data');
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusinessData();
    } else {
      setError('Business ID is required');
      setLoading(false);
    }
  }, [businessId]);

  const calculateProfileScore = (data: any): number => {
    if (data.profileScore) return data.profileScore;
    
    let score = 0;
    const fields = [
      'name', 'location', 'mobile', 'address', 'timings', 
      'categories', 'images', 'email', 'latitude', 'longitude'
    ];
    
    fields.forEach(field => {
      if (data[field] && data[field].toString().trim().length > 0) {
        score++;
      }
    });
    
    return Math.round((score / fields.length) * 100);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // New function: When clicking on any field in modal
  const handleFieldClick = (fieldName: string) => {
    // Close modal first
    setShowEditModal(false);
    
    // Navigate to edit page with businessId
    router.push(`/business-name-edit/${businessId}?field=${fieldName}`);
  };

  // Rest of your existing handlers...
  const handleAdvertise = () => {
    alert('Navigate to advertise page with 50% OFF offer!');
  };

  const handleReviews = () => {
    alert('Navigate to reviews page');
  };

  const handleAddContact = () => {
    alert('Add contact clicked');
  };

  const handleAddEmail = () => {
    alert('Add email clicked');
  };

  const handleAddWhatsApp = () => {
    alert('Add WhatsApp clicked');
  };

  const handleUploadCatalogue = () => {
    alert('Upload catalogue clicked');
  };

  const handleAddOffer = () => {
    alert('Add offer clicked');
  };

  const handleAddWebsite = () => {
    alert('Add website clicked');
  };

  const handleAddVideo = () => {
    alert('Add video clicked');
  };

  const handleAddSocialLink = () => {
    alert('Add social link clicked');
  };

  const handleRatingsQR = () => {
    alert('Ratings QR clicked');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="business-edit-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          Loading business data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="business-edit-page error">
        <div className="error-message">
          <h2>Error Loading Business Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="business-edit-page">
      {/* Top Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="header-left">
            <button className="back-btn" onClick={() => router.back()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Back
            </button>
          </div>
          
          <div className="header-center">
            <h1 className="business-name">{business.name}</h1>
            <p className="business-location">{business.location}</p>
          </div>
          
          <div className="header-right">
            <div className="profile-score">
              <div className="score-circle">
                <span className="score-value">{business.profileScore}%</span>
              </div>
              <span className="score-label">Profile Score</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-container">
        <div className="content-wrapper">
          {/* Profile Score Banner */}
          <section className="score-banner">
            <div className="banner-text">
              <h2 className="banner-title">Increase Business Profile Score</h2>
              <p className="banner-subtitle">Reach out to more customers</p>
            </div>
            <div className="banner-score-display">
              <div className="score-circle-large">
                <span className="score-value-large">{business.profileScore}%</span>
              </div>
            </div>
          </section>

          {/* Quick Links Grid */}
          <div className="quick-links-grid">
            
            {/* Edit Profile */}
            <div className="quick-link-item" onClick={handleEditProfile}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(255, 232, 206)' }}>
                <div className="link-count">{business.reviewsCount}</div>
                <Edit size={20} />
              </div>
              <div className="link-text">Edit Business</div>
            </div>

            {/* Advertise */}
            <div className="quick-link-item" onClick={handleAdvertise}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(231, 217, 255)' }}>
                <span className="link-badge">50% OFF</span>
                <Megaphone size={20} />
              </div>
              <div className="link-text">Advertise</div>
            </div>

            {/* Reviews */}
            <div className="quick-link-item" onClick={handleReviews}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(223, 245, 255)' }}>
                <MessageSquare size={20} />
              </div>
              <div className="link-text">Reviews</div>
            </div>

            {/* Add Photos */}
            <div className="quick-link-item" onClick={() => alert('Add photos clicked')}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(218, 248, 204)' }}>
                <Camera size={20} />
              </div>
              <div className="link-text">Add Photos</div>
            </div>

            {/* Add Contact */}
            <div className="quick-link-item" onClick={handleAddContact}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(237, 231, 229)' }}>
                <div className="link-count">{business.addContactCount}</div>
                <Phone size={20} />
              </div>
              <div className="link-text">Add Contact</div>
            </div>

            {/* Add Email */}
            <div className="quick-link-item" onClick={handleAddEmail}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(218, 248, 204)' }}>
                <Mail size={20} />
              </div>
              <div className="link-text">Add Email</div>
            </div>

            {/* Add WhatsApp */}
            <div className="quick-link-item" onClick={handleAddWhatsApp}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(191, 239, 229)' }}>
                <MessageCircle size={20} />
              </div>
              <div className="link-text">Add WhatsApp</div>
            </div>

            {/* Upload Catalogue */}
            <div className="quick-link-item" onClick={handleUploadCatalogue}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(237, 231, 229)' }}>
                <span className="link-badge">FREE</span>
                <Upload size={20} />
              </div>
              <div className="link-text">Upload Catalogue</div>
            </div>

            {/* Add Offer */}
            <div className="quick-link-item" onClick={handleAddOffer}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(191, 239, 229)' }}>
                <span className="link-badge">CHRISTMAS</span>
                <Gift size={20} />
              </div>
              <div className="link-text">Add Offer</div>
            </div>

            {/* Add Website */}
            <div className="quick-link-item" onClick={handleAddWebsite}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(210, 235, 255)' }}>
                <Globe size={20} />
              </div>
              <div className="link-text">Add Website</div>
            </div>

            {/* Add Video */}
            <div className="quick-link-item" onClick={handleAddVideo}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(252, 220, 250)' }}>
                <Video size={20} />
              </div>
              <div className="link-text">Add Video</div>
            </div>

            {/* Add Social Links */}
            <div className="quick-link-item" onClick={handleAddSocialLink}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(205, 249, 237)' }}>
                <Share2 size={20} />
              </div>
              <div className="link-text">Add Social Links</div>
            </div>

            {/* Ratings QR */}
            <div className="quick-link-item" onClick={handleRatingsQR}>
              <div className="link-icon-box" style={{ backgroundColor: 'rgb(252, 220, 250)' }}>
                <QrCode size={20} />
              </div>
              <div className="link-text">Ratings QR</div>
            </div>

          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <>
          <div className="modal-overlay" onClick={handleCloseModal}></div>
          
          <div className="edit-modal">
            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="modal-title">Edit Business Profile</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - ALL ITEMS ARE NOW CLICKABLE */}
            <div className="modal-body">
              <div className="profile-section">
                
                {/* Business Name - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('name')}
                >
                  <div className="item-icon">
                    <Building size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Business Name
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">{business.name}</div>
                  </div>
                </div>

                {/* Contact Details - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('contact')}
                >
                  <div className="item-icon">
                    <Phone size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Contact Details
                      <span className={`item-status ${business.contactDetails ? 'complete' : 'missing'}`}>
                        {business.contactDetails ? 'Complete' : 'Missing Info'}
                      </span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">{business.contactDetails || 'Not added'}</div>
                  </div>
                </div>

                {/* Business Address - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('address')}
                >
                  <div className="item-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Business Address
                      <span className={`item-status ${business.address ? 'complete' : 'missing'}`}>
                        {business.address ? 'Complete' : 'Street Missing'}
                      </span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">{business.address || 'Not added'}</div>
                  </div>
                </div>

                {/* Map Location - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('map-location')}
                >
                  <div className="item-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Map Location
                      <span className="item-status missing">Missing Info</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value empty">Not added</div>
                  </div>
                </div>

                {/* Business Timings - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('timings')}
                >
                  <div className="item-icon">
                    <Clock size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Business Timings
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">{business.timings}</div>
                  </div>
                </div>

                {/* Year of Establishment - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('year-establishment')}
                >
                  <div className="item-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Year of Establishment
                      <span className="item-status missing">Missing Info</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value empty">{business.yearOfEstablishment}</div>
                  </div>
                </div>

                {/* Business Categories - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('categories')}
                >
                  <div className="item-icon">
                    <Tag size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Business Categories
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">{business.categories}</div>
                  </div>
                </div>

                {/* Yearly Turnover - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('turnover')}
                >
                  <div className="item-icon">
                    <DollarSign size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Yearly Turnover
                      <span className="item-status missing">Missing Info</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value empty">{business.yearlyTurnover}</div>
                  </div>
                </div>

                {/* Number of Employees - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('employees')}
                >
                  <div className="item-icon">
                    <Users size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Number of Employees
                      <span className="item-status missing">Missing Info</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value empty">{business.numberOfEmployees}</div>
                  </div>
                </div>

                <div className="divider"></div>

                {/* Business Website - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('website')}
                >
                  <div className="item-icon">
                    <Globe size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Business Website
                      <span className="item-status missing">Missing Info</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">Add Your Website Link to Showcase On Your Business Profile Page</div>
                  </div>
                </div>

                {/* Social Media - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('social-media')}
                >
                  <div className="item-icon">
                    <Share size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Social Media
                      <span className="item-status missing">Missing Info</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value empty">{business.socialMedia}</div>
                  </div>
                </div>

                {/* Business Tools - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('tools')}
                >
                  <div className="item-icon">
                    <Edit size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Business Tools
                      <span className="item-status pending">20 Pending</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">Manage Offers, Reviews and more</div>
                  </div>
                </div>

                {/* KYC, Payments & Invoices - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('kyc')}
                >
                  <div className="item-icon">
                    <Shield size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      KYC, Payments & Invoices
                      <span className="item-status missing">Missing</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">Update KYC Details</div>
                  </div>
                </div>

                {/* Additional Business Info - CLICKABLE */}
                <div 
                  className="profile-item clickable"
                  onClick={() => handleFieldClick('additional-info')}
                >
                  <div className="item-icon">
                    <Info size={20} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      Additional Business Info
                      <span className="item-status missing">Info Missing</span>
                      <ArrowRight className="item-arrow" size={16} />
                    </div>
                    <div className="item-value">Update Classes for, Courses Taught, Mode of Instruction and more</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessEditPage;