'use client'
import { API_ENDPOINTS2 } from '@/configs/api';
import { useState, useEffect } from 'react'

interface BusinessTiming {
  open: string
  close: string
  closed: boolean
}

interface ContactPerson {
  contact_id?: number
  contact_person_name?: string
  designation?: string
  alternate_mobile?: string
  whatsapp_number?: string
  email?: string
  title?: string
  is_primary?: boolean
}

interface BusinessData {
  mobile?: string
  address?: string
  primary_contact_info?: ContactPerson
  all_contact_persons?: ContactPerson[]
  business_timing?: {
    mon?: BusinessTiming
    tue?: BusinessTiming
    wed?: BusinessTiming
    thu?: BusinessTiming
    fri?: BusinessTiming
    sat?: BusinessTiming
    sun?: BusinessTiming
  }
  business_name?: string
  gstin?: string
  website?: string
  latitude?: number
  longitude?: number
  total_contacts?: number
}

interface BusinessViewRightSideComponentProps {
  businessId: string;
}

export default function BusinessViewRightSideComponent({ 
  businessId 
}: BusinessViewRightSideComponentProps) {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllTimings, setShowAllTimings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('contact')
  const [showAllContacts, setShowAllContacts] = useState(false)
  const [activeContactIndex, setActiveContactIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Automatic animation states
  const [autoCallAnimation, setAutoCallAnimation] = useState(false)
  const [autoWhatsAppAnimation, setAutoWhatsAppAnimation] = useState(false)
//console.log('BBBBBBBAAAAA',businessData);
  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(API_ENDPOINTS2.AUTH.BUSINESS_VIEW_RIGHTSIDE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_id: businessId
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        
        
        if (data.success && data.data) {
          setBusinessData(data.data)
          
          // If there are multiple contacts, set primary contact as active
          if (data.data.all_contact_persons && data.data.all_contact_persons.length > 0) {
            const primaryIndex = data.data.all_contact_persons.findIndex(
              (contact: ContactPerson) => contact.is_primary
            );
            setActiveContactIndex(primaryIndex >= 0 ? primaryIndex : 0);
          }
        } else {
          throw new Error(data.message || 'No business data found')
        }
      } catch (err) {
        console.error('Error fetching business data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load business data')
        
        // Set default data structure if API fails
        setBusinessData({
          business_name: 'Business Information',
          address: 'Address not available',
          mobile: 'Not available',
          primary_contact_info: {
            contact_person_name: 'Not specified',
            email: 'Not available',
            designation: 'Not available',
            title: 'Not available',
          },
          all_contact_persons: [{
            contact_person_name: 'Not specified',
            email: 'Not available',
            designation: 'Not available',
            title: 'Not available',
          }],
          business_timing: {
            mon: { open: '09:00', close: '18:00', closed: false },
            tue: { open: '09:00', close: '18:00', closed: false },
            wed: { open: '09:00', close: '18:00', closed: false },
            thu: { open: '09:00', close: '18:00', closed: false },
            fri: { open: '09:00', close: '18:00', closed: false },
            sat: { open: '09:00', close: '18:00', closed: false },
            sun: { open: '09:00', close: '18:00', closed: true }
          }
        })
      } finally {
        setLoading(false)
      }
    }

    if (businessId) {
      fetchBusinessData()
    }
  }, [businessId])

  // Automatic animation effects
  useEffect(() => {
    // Start automatic animations after component loads
    const animationTimer = setTimeout(() => {
      // Call icon animation sequence
      const callAnimationInterval = setInterval(() => {
        setAutoCallAnimation(true)
        setTimeout(() => setAutoCallAnimation(false), 2000)
      }, 8000) // Repeat every 8 seconds

      // WhatsApp icon animation sequence (staggered)
      const whatsAppAnimationInterval = setInterval(() => {
        setTimeout(() => {
          setAutoWhatsAppAnimation(true)
          setTimeout(() => setAutoWhatsAppAnimation(false), 2000)
        }, 2000)
      }, 10000) // Repeat every 10 seconds

      // Cleanup intervals
      return () => {
        clearInterval(callAnimationInterval)
        clearInterval(whatsAppAnimationInterval)
      }
    }, 3000) // Start animations after 3 seconds

    return () => clearTimeout(animationTimer)
  }, [])

  // Format business timings
  const formatBusinessTimings = () => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    
    const today = new Date().getDay()
    const adjustedToday = today === 0 ? 6 : today - 1 // Adjust for Monday start
    
    return days.map((day, index) => ({
      day: dayLabels[index],
      isToday: index === adjustedToday,
      timing: businessData?.business_timing?.[day] || { 
        open: '09:00', 
        close: '18:00', 
        closed: false 
      }
    }))
  }

  const timings = formatBusinessTimings()
  const todayTiming = timings.find(t => t.isToday)?.timing
  const isOpenToday = todayTiming && !todayTiming.closed

  // Get all contact persons
  const allContacts = businessData?.all_contact_persons || [];
  const hasMultipleContacts = allContacts.length > 1;
  const activeContact = allContacts[activeContactIndex] || businessData?.primary_contact_info;

  // Get total contacts count
  const totalContacts = businessData?.total_contacts || allContacts.length;

  // Touch handlers for slider
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasMultipleContacts) {
      handleNextContact();
    }

    if (isRightSwipe && hasMultipleContacts) {
      handlePrevContact();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleCopyAddress = async () => {
    if (businessData?.address) {
      try {
        await navigator.clipboard.writeText(businessData.address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy address:', err)
      }
    }
  }
   console.log('Directions URL:',businessData?.latitude)
const handleGetDirections = () => {
  const lat = Number(businessData?.latitude)
  const lng = Number(businessData?.longitude)

  if (!isNaN(lat) && !isNaN(lng)) {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(mapsUrl, '_blank')
 
  } else {
    alert('GPS coordinates not available for directions')
  }
}

  const handleCall = (phoneNumber?: string) => {
    const number = phoneNumber || businessData?.mobile;
    if (number) {
      window.open(`tel:${number}`, '_self')
    }
  }

  const handleWhatsApp = (phoneNumber?: string) => {
    const phone = phoneNumber || businessData?.mobile || activeContact?.whatsapp_number;
    if (phone) {
      const message = `Hello! I'm interested in your services. Could you please provide more information?`
      const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleShare = async () => {
    const businessName = businessData?.business_name || businessData?.primary_contact_info?.contact_person_name || 'Business'
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: businessData?.address,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEmail = (email?: string) => {
    const emailAddress = email || activeContact?.email;
    if (emailAddress) {
      window.open(`mailto:${emailAddress}`, '_blank')
    }
  }

  const handleWebsite = () => {
    if (businessData?.website) {
      const websiteUrl = businessData.website.startsWith('http') 
        ? businessData.website 
        : `https://${businessData.website}`
      window.open(websiteUrl, '_blank')
    }
  }

  const handleNextContact = () => {
    if (hasMultipleContacts) {
      setActiveContactIndex((prev) => (prev + 1) % allContacts.length);
    }
  };

  const handlePrevContact = () => {
    if (hasMultipleContacts) {
      setActiveContactIndex((prev) => (prev - 1 + allContacts.length) % allContacts.length);
    }
  };

  const toggleAllContacts = () => {
    setShowAllContacts(!showAllContacts);
  };

  // Loading state
  if (loading) {
    return (
      <div className="business-sidebar loading">
        <div className="sidebar-header">
          <div className="header-gradient">
            <div className="header-content">
              <div className="skeleton business-name-skeleton"></div>
              <div className="skeleton status-skeleton"></div>
            </div>
          </div>
        </div>
        
        <div className="tab-navigation">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton tab-skeleton"></div>
          ))}
        </div>
        
        <div className="tab-content">
          <div className="skeleton content-skeleton"></div>
          <div className="skeleton content-skeleton"></div>
          <div className="skeleton content-skeleton"></div>
        </div>
        
        <style jsx>{`
          .business-sidebar.loading {
            background: white;
            border-radius: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e8e8e8;
            overflow: hidden;
          }
          
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 6px;
          }
          
          .business-name-skeleton {
            height: 18px;
            width: 70%;
            margin-bottom: 6px;
          }
          
          .status-skeleton {
            height: 14px;
            width: 60px;
          }
          
          .tab-skeleton {
            height: 36px;
            flex: 1;
            margin: 0 3px;
          }
          
          .content-skeleton {
            height: 14px;
            margin-bottom: 6px;
          }
          
          .content-skeleton:last-child {
            width: 60%;
          }
          
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    )
  }

  // Error state
  if (error && !businessData) {
    return (
      <div className="business-sidebar error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Information</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
        
        <style jsx>{`
          .business-sidebar.error {
            background: white;
            border-radius: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e8e8e8;
            padding: 24px 14px;
            text-align: center;
          }
          
          .error-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          h3 {
            color: #ef4444;
            margin: 0 0 5px 0;
            font-size: 14px;
            font-weight: 600;
          }
          
          p {
            color: #6b7280;
            margin-bottom: 14px;
            font-size: 12px;
            line-height: 1.3;
          }
          
          .retry-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 7px 14px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            font-size: 12px;
          }
          
          .retry-btn:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="business-sidebar">
      {/* Header with Gradient */}
      <div className="sidebar-header">
        <div className="header-gradient">
          <div className="header-content">
            <h2 className="business-name">
              {businessData?.business_name || businessData?.primary_contact_info?.contact_person_name || 'Business Details'}
            </h2>
            <div className={`status-badge ${isOpenToday ? 'open' : 'closed'}`}>
              <span className="status-dot"></span>
              {isOpenToday ? 'Open Now' : 'Closed'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <span className="tab-icon">📞</span>
          <span className="tab-text">Contact</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <span className="tab-icon">ℹ️</span>
          <span className="tab-text">Info</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          <span className="tab-icon">🕒</span>
          <span className="tab-text">Hours</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="tab-panel">
            {/* Contact Slider Header */}
            {hasMultipleContacts && (
              <div className="contact-slider-header">
                <div className="slider-controls">
                  <button 
                    className="slider-nav-btn prev" 
                    onClick={handlePrevContact}
                    disabled={allContacts.length <= 1}
                  >
                    ←
                  </button>
                  
                  <div className="slider-info">
                    <div className="slider-title">
                      {activeContactIndex + 1}/{allContacts.length}
                    </div>
                    <div className="slider-dots">
                      {allContacts.map((_, index) => (
                        <button
                          key={index}
                          className={`slider-dot ${index === activeContactIndex ? 'active' : ''}`}
                          onClick={() => setActiveContactIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="slider-nav-btn next" 
                    onClick={handleNextContact}
                    disabled={allContacts.length <= 1}
                  >
                    →
                  </button>
                </div>
                
                {!showAllContacts && (
                  <button 
                    className="view-all-btn"
                    onClick={toggleAllContacts}
                  >
                    👥 View All {totalContacts} Contacts
                  </button>
                )}
              </div>
            )}

            {/* Contact Card - Full Width */}
            <div 
              className="contact-full-width-card"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Designation with Primary Badge */}
              <div className="designation-header-full">
                <div className="designation-content">
                  <span className="designation-text-full">
                    {activeContact?.designation || 'Contact Person'}
                  </span>
                  {activeContact?.is_primary && (
                    <span className="primary-badge-full">Primary</span>
                  )}
                </div>
                {hasMultipleContacts && (
                  <div className="contact-counter">
                    {activeContactIndex + 1}/{allContacts.length}
                  </div>
                )}
              </div>

              {/* Contact Name with Title */}
              <div className="contact-name-full">
                <span className="contact-title-full">{activeContact?.title || ''}</span>
                <span className="contact-name-text-full">{activeContact?.contact_person_name || 'Not specified'}</span>
              </div>

              {/* Contact Details Grid */}
              <div className="contact-details-grid">
                {/* Mobile */}
                <div className="contact-detail-card">
                  <div className="detail-icon-full">📱</div>
                  <div className="detail-content-full">
                    <div className="detail-label-full">Mobile</div>
                    <div className="detail-value-full">
                      {activeContact?.alternate_mobile || businessData?.mobile || 'Not available'}
                    </div>
                  </div>
                  {(activeContact?.alternate_mobile || businessData?.mobile) && (
                    <button 
                      className="detail-action-btn"
                      onClick={() => handleCall(activeContact?.alternate_mobile)}
                      title="Call"
                    >
                      📞
                    </button>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="contact-detail-card">
                  <div className="detail-icon-full">💬</div>
                  <div className="detail-content-full">
                    <div className="detail-label-full">WhatsApp</div>
                    <div className="detail-value-full">
                      {activeContact?.whatsapp_number || activeContact?.alternate_mobile || businessData?.mobile || 'Not available'}
                    </div>
                  </div>
                  {(activeContact?.whatsapp_number || activeContact?.alternate_mobile || businessData?.mobile) && (
                    <button 
                      className="detail-action-btn whatsapp"
                      onClick={() => handleWhatsApp(activeContact?.whatsapp_number || activeContact?.alternate_mobile)}
                      title="WhatsApp"
                    >
                      💬
                    </button>
                  )}
                </div>

                {/* Email */}
                <div className="contact-detail-card">
                  <div className="detail-icon-full">📧</div>
                  <div className="detail-content-full">
                    <div className="detail-label-full">Email</div>
                    <div className="detail-value-full">
                      {activeContact?.email || 'Not available'}
                    </div>
                  </div>
                  {activeContact?.email && (
                    <button 
                      className="detail-action-btn email"
                      onClick={() => handleEmail(activeContact?.email)}
                      title="Email"
                    >
                      📧
                    </button>
                  )}
                </div>
              </div>

              {/* Compact Quick Actions */}
              <div className="quick-actions-compact">
                {(activeContact?.alternate_mobile || businessData?.mobile) && (
                  <button 
                    className={`action-btn-compact primary ${autoCallAnimation ? 'auto-shake-animation' : ''}`} 
                    onClick={() => handleCall(activeContact?.alternate_mobile)}
                    title="Call Now"
                  >
                    <span className="action-icon-compact">📞</span>
                    <span className="action-text-compact">Call</span>
                  </button>
                )}
                
                {(activeContact?.whatsapp_number || activeContact?.alternate_mobile || businessData?.mobile) && (
                  <button 
                    className={`action-btn-compact secondary ${autoWhatsAppAnimation ? 'auto-shake-animation' : ''}`} 
                    onClick={() => handleWhatsApp(activeContact?.whatsapp_number || activeContact?.alternate_mobile)}
                    title="WhatsApp"
                  >
                    <span className="action-icon-compact">💬</span>
                    <span className="action-text-compact">WhatsApp</span>
                  </button>
                )}
                
                {activeContact?.email && (
                  <button 
                    className="action-btn-compact tertiary"
                    onClick={() => handleEmail(activeContact?.email)}
                    title="Email"
                  >
                    <span className="action-icon-compact">📧</span>
                    <span className="action-text-compact">Email</span>
                  </button>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="address-section">
              <div className="section-title">
                <span className="section-icon">📍</span>
                Address
              </div>
              <p className="address-text">
                {businessData?.address || 'Address not available'}
              </p>
              <div className="address-actions">
                <button 
                  className="address-btn" 
                  onClick={handleGetDirections}
                  disabled={!businessData?.address && !businessData?.latitude}
                  title="Get Directions"
                >
                  <span className="btn-icon">🗺️</span>
                  <span>Directions</span>
                </button>
                <button 
                  className="address-btn" 
                  onClick={handleCopyAddress}
                  disabled={!businessData?.address}
                  title="Copy Address"
                >
                  <span className="btn-icon">{copied ? '✅' : '📋'}</span>
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* All Contacts View Modal */}
            {showAllContacts && (
              <div className="all-contacts-modal">
                <div className="modal-overlay" onClick={toggleAllContacts} />
                <div className="modal-content">
                  <div className="modal-header">
                    <div className="modal-title">All Contacts ({totalContacts})</div>
                    <button className="modal-close" onClick={toggleAllContacts} title="Close">✕</button>
                  </div>
                  <div className="modal-body">
                    {allContacts.map((contact, index) => (
                      <div 
                        key={contact.contact_id || index}
                        className={`modal-contact-card ${index === activeContactIndex ? 'active' : ''}`}
                        onClick={() => {
                          setActiveContactIndex(index);
                          setShowAllContacts(false);
                        }}
                      >
                        <div className="modal-contact-header">
                          <div className="modal-contact-icon">👤</div>
                          <div className="modal-contact-info">
                            <div className="modal-contact-name">
                              {contact.title || ''} {contact.contact_person_name || 'Not specified'}
                              {contact.is_primary && <span className="modal-primary-badge">Primary</span>}
                            </div>
                            <div className="modal-contact-designation">
                              {contact.designation || 'Contact Person'}
                            </div>
                          </div>
                          <div className="modal-contact-counter">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="modal-contact-details">
                          {contact.alternate_mobile && (
                            <div className="modal-contact-detail">
                              <span className="modal-detail-icon">📱</span>
                              <span className="modal-detail-text">{contact.alternate_mobile}</span>
                            </div>
                          )}
                          
                          {contact.email && (
                            <div className="modal-contact-detail">
                              <span className="modal-detail-icon">📧</span>
                              <span className="modal-detail-text">{contact.email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="modal-contact-actions">
                          {contact.alternate_mobile && (
                            <button 
                              className="modal-action-btn call"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCall(contact.alternate_mobile);
                              }}
                              title="Call"
                            >
                              📞
                            </button>
                          )}
                          
                          {(contact.whatsapp_number || contact.alternate_mobile) && (
                            <button 
                              className="modal-action-btn whatsapp"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp(contact.whatsapp_number || contact.alternate_mobile);
                              }}
                              title="WhatsApp"
                            >
                              💬
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="tab-panel">
            {/* Business Information */}
            <div className="info-section">
              <div className="info-card">
                <div className="info-title">Business Details</div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`info-value ${isOpenToday ? 'open' : 'closed'}`}>
                      {isOpenToday ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Contacts</span>
                    <span className="info-value">
                      {totalContacts || '0'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">GSTIN</span>
                    <span className="info-value">
                      {businessData?.gstin || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Website</span>
                    <span 
                      className={`info-value ${businessData?.website ? 'link' : ''}`}
                      onClick={businessData?.website ? handleWebsite : undefined}
                      title={businessData?.website}
                    >
                      {businessData?.website || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="action-grid">
                <button className="action-card" onClick={handleShare} title="Share">
                  <div className="action-card-icon">🔗</div>
                  <span className="action-card-text">Share</span>
                </button>
                
                <button className="action-card" title="Rate">
                  <div className="action-card-icon">⭐</div>
                  <span className="action-card-text">Rate</span>
                </button>
                
                <button className="action-card" title="Edit">
                  <div className="action-card-icon">📝</div>
                  <span className="action-card-text">Edit</span>
                </button>
                
                <button 
                  className="action-card" 
                  onClick={() => handleEmail(activeContact?.email)}
                  disabled={!activeContact?.email}
                  title="Email"
                >
                  <div className="action-card-icon">📧</div>
                  <span className="action-card-text">Email</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hours Tab */}
        {activeTab === 'hours' && (
          <div className="tab-panel">
            {/* Today's Timing */}
            <div className="today-timing">
              <div className="section-title">Today's Hours</div>
              <div className={`timing-card ${isOpenToday ? 'open' : 'closed'}`}>
                <div className="timing-status">
                  <span className="status-indicator"></span>
                  {isOpenToday ? (
                    <span>Open until {todayTiming?.close}</span>
                  ) : (
                    <span>Closed Today</span>
                  )}
                </div>
              </div>
            </div>

            {/* All Timings */}
            <div className="all-timings">
              <div className="section-title">Business Hours</div>
              <div className="timing-list">
                {timings.map(({ day, isToday, timing }) => (
                  <div key={day} className={`timing-item ${isToday ? 'today' : ''}`}>
                    <span className="day">
                      {day} {isToday && <span className="today-badge">Today</span>}
                    </span>
                    <span className="time">
                      {timing.closed ? (
                        <span className="closed">Closed</span>
                      ) : (
                        <span className="open">{timing.open} - {timing.close}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className="suggest-timing-btn" title="Suggest New Timings">
                <span className="btn-icon">✏️</span>
                Suggest New Timings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="floating-actions">
        <button 
          className={`fab primary ${autoCallAnimation ? 'auto-shake-animation' : ''}`} 
          onClick={() => handleCall(activeContact?.alternate_mobile)}
          disabled={!activeContact?.alternate_mobile && !businessData?.mobile}
          title="Call"
        >
          📞
        </button>
        <button 
          className={`fab secondary ${autoWhatsAppAnimation ? 'auto-shake-animation' : ''}`} 
          onClick={() => handleWhatsApp(activeContact?.whatsapp_number)}
          disabled={!activeContact?.whatsapp_number && !businessData?.mobile}
          title="WhatsApp"
        >
          💬
        </button>
      </div>

      <style jsx>{`
        .business-sidebar {
          background: white;
          border-radius: 12px;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
          border: 1px solid #e8e8e8;
          overflow: hidden;
          position: relative;
        }

        /* Full Width Contact Card Styles - EXTRA SMALL FONTS */
        .contact-full-width-card {
          width: 100%;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          padding: 0;
          margin-bottom: 14px;
          position: relative;
          overflow: hidden;
        }

        /* Designation Header - Full Width */
        .designation-header-full {
          width: 100%;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .designation-content {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .designation-text-full {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .primary-badge-full {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .contact-counter {
          background: #64748b;
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
          white-space: nowrap;
          flex-shrink: 0;
          margin-left: 8px;
        }

        /* Contact Name - Full Width */
        .contact-name-full {
          width: 100%;
          padding: 12px 14px 6px 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          border-bottom: 1px solid #f1f5f9;
        }

        .contact-title-full {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .contact-name-text-full {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.2;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Contact Details Grid - Full Width */
        .contact-details-grid {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .contact-detail-card {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 10px 14px;
          gap: 10px;
          border-bottom: 1px solid #f1f5f9;
          min-height: 48px;
        }

        .contact-detail-card:last-child {
          border-bottom: none;
        }

        .detail-icon-full {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 8px;
          font-size: 14px;
          flex-shrink: 0;
        }

        .detail-content-full {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .detail-label-full {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          font-weight: 600;
          line-height: 1.1;
        }

        .detail-value-full {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          word-break: break-all;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .detail-action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          padding: 0;
        }

        .detail-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
        }

        .detail-action-btn.whatsapp {
          background: #10b981;
        }

        .detail-action-btn.email {
          background: #8b5cf6;
        }

        /* COMPACT Quick Actions */
        .quick-actions-compact {
          width: 100%;
          display: flex;
          gap: 8px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-top: 1px solid #e2e8f0;
        }

        .action-btn-compact {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 6px;
          border: none;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          min-height: 40px;
        }

        .action-btn-compact.primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .action-btn-compact.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        .action-btn-compact.secondary {
          background: #10b981;
          color: white;
        }

        .action-btn-compact.secondary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }

        .action-btn-compact.tertiary {
          background: white;
          border: 1px solid #8b5cf6;
          color: #8b5cf6;
          padding: 7px 6px;
        }

        .action-btn-compact.tertiary:hover {
          background: #8b5cf6;
          color: white;
          transform: translateY(-1px);
        }

        .action-icon-compact {
          font-size: 12px;
          line-height: 1;
        }

        .action-text-compact {
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
        }

        /* Contact Slider Header Styles */
        .contact-slider-header {
          margin-bottom: 12px;
        }

        .slider-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .slider-info {
          flex: 1;
          text-align: center;
        }

        .slider-title {
          font-size: 11px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 6px 0;
        }

        .slider-dots {
          display: flex;
          gap: 4px;
          justify-content: center;
        }

        .slider-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .slider-dot.active {
          background: #3b82f6;
          transform: scale(1.2);
        }

        .slider-nav-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          padding: 0;
        }

        .slider-nav-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: scale(1.05);
        }

        .slider-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .view-all-btn {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 8px;
          background: #f8fafc;
          border: 1px dashed #e2e8f0;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #f0f7ff;
        }

        /* All Contacts Modal */
        .all-contacts-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 12px;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          max-height: 65vh;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
          animation: modalSlideUp 0.2s ease;
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .modal-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .modal-close {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .modal-close:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .modal-body {
          padding: 14px;
          overflow-y: auto;
          max-height: calc(65vh - 52px);
        }

        .modal-contact-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-contact-card:hover {
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
        }

        .modal-contact-card.active {
          border-color: #3b82f6;
          background: #f0f7ff;
        }

        .modal-contact-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .modal-contact-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 6px;
          font-size: 14px;
          flex-shrink: 0;
        }

        .modal-contact-info {
          flex: 1;
          min-width: 0;
        }

        .modal-contact-name {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .modal-primary-badge {
          background: #3b82f6;
          color: white;
          padding: 1px 4px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .modal-contact-designation {
          font-size: 10px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .modal-contact-counter {
          background: #64748b;
          color: white;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .modal-contact-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 8px;
        }

        .modal-contact-detail {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #475569;
        }

        .modal-detail-icon {
          width: 18px;
          text-align: center;
          font-size: 9px;
          opacity: 0.7;
          flex-shrink: 0;
        }

        .modal-contact-actions {
          display: flex;
          gap: 5px;
        }

        .modal-action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          padding: 0;
        }

        .modal-action-btn.call {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .modal-action-btn.call:hover {
          background: #3b82f6;
          color: white;
        }

        .modal-action-btn.whatsapp {
          color: #10b981;
          border-color: #10b981;
        }

        .modal-action-btn.whatsapp:hover {
          background: #10b981;
          color: white;
        }

        /* Header Styles - Very Small */
        .sidebar-header {
          position: relative;
        }

        .header-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px 14px;
          position: relative;
          overflow: hidden;
        }

        .header-gradient::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 6px 6px;
          opacity: 0.3;
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .business-name {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          color: white;
        }

        .status-badge.open {
          background: rgba(34, 197, 94, 0.9);
        }

        .status-badge.closed {
          background: rgba(239, 68, 68, 0.9);
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Automatic Shake Animation - Very Small */
        .auto-shake-animation {
          animation: autoShake 2s ease-in-out;
        }

        @keyframes autoShake {
          0%, 100% { 
            transform: translateX(0) rotate(0) scale(1);
            box-shadow: 0 1px 6px rgba(59, 130, 246, 0.3);
          }
          2%, 18% { 
            transform: translateX(-1px) rotate(-1deg) scale(1.02);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          }
          4%, 16% { 
            transform: translateX(1px) rotate(1deg) scale(1.02);
          }
          6%, 14% { 
            transform: translateX(-0.5px) rotate(-0.5deg) scale(1.01);
          }
          8%, 12% { 
            transform: translateX(0.5px) rotate(0.5deg) scale(1.01);
          }
          10% { 
            transform: translateX(0) rotate(0) scale(1.02);
            box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
          }
        }

        /* Enhanced Icon Animation for Auto-shake */
        .action-btn-compact.auto-shake-animation .action-icon-compact,
        .fab.auto-shake-animation {
          animation: autoIconPulse 2s ease-in-out;
        }

        @keyframes autoIconPulse {
          0%, 100% { 
            transform: scale(1);
          }
          10%, 30%, 50%, 70%, 90% { 
            transform: scale(1.1) rotate(3deg);
          }
          20%, 40%, 60%, 80% { 
            transform: scale(1.1) rotate(-3deg);
          }
        }

        /* Tab Navigation - Very Small */
        .tab-navigation {
          display: flex;
          background: #f8fafc;
          padding: 0 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 4px;
          background: none;
          border: none;
          font-size: 10px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 42px;
        }

        .tab-btn.active {
          color: #3b82f6;
          font-weight: 600;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: #3b82f6;
          border-radius: 1px 1px 0 0;
        }

        .tab-icon {
          font-size: 12px;
          line-height: 1;
        }

        .tab-text {
          font-size: 10px;
          line-height: 1;
          white-space: nowrap;
        }

        /* Tab Content */
        .tab-content {
          padding: 12px;
        }

        .tab-panel {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Address Section - Very Small */
        .address-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px;
          margin-top: 12px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .section-icon {
          font-size: 12px;
        }

        .address-text {
          font-size: 11px;
          line-height: 1.3;
          color: #475569;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .address-actions {
          display: flex;
          gap: 6px;
        }

        .address-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .address-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .address-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 10px;
        }

        /* Info Section - Very Small */
        .info-section {
          space-y-12;
        }

        .info-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .info-title {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 10px 0;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-size: 10px;
          color: #64748b;
          white-space: nowrap;
        }

        .info-value {
          font-size: 10px;
          font-weight: 500;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60%;
          text-align: right;
        }

        .info-value.open {
          color: #10b981;
        }

        .info-value.closed {
          color: #ef4444;
        }

        .info-value.link {
          color: #3b82f6;
          cursor: pointer;
          font-size: 9px;
        }

        .info-value.link:hover {
          text-decoration: underline;
        }

        /* Action Grid - Very Small */
        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 44px;
        }

        .action-card:hover:not(:disabled) {
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .action-card:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .action-card-icon {
          font-size: 12px;
        }

        .action-card-text {
          font-size: 9px;
          font-weight: 500;
          color: #475569;
          white-space: nowrap;
        }

        /* Hours Section - Very Small */
        .today-timing {
          margin-bottom: 16px;
        }

        .timing-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 10px;
          border-left: 2px solid #e2e8f0;
        }

        .timing-card.open {
          border-left-color: #10b981;
        }

        .timing-card.closed {
          border-left-color: #ef4444;
        }

        .timing-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
        }

        .status-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .timing-card.open .status-indicator {
          color: #10b981;
          animation: pulse 2s infinite;
        }

        .timing-card.closed .status-indicator {
          color: #ef4444;
        }

        /* Timing List - Very Small */
        .all-timings {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px;
        }

        .timing-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }

        .timing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        }

        .timing-item.today {
          background: white;
          margin: 0 -6px;
          padding: 5px 6px;
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .day {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 500;
          color: #1e293b;
        }

        .today-badge {
          background: #3b82f6;
          color: white;
          padding: 1px 3px;
          border-radius: 2px;
          font-size: 8px;
          font-weight: 500;
        }

        .time {
          font-size: 10px;
          font-weight: 500;
        }

        .time .open {
          color: #10b981;
        }

        .time .closed {
          color: #ef4444;
        }

        .suggest-timing-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggest-timing-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        /* Floating Actions - Very Small */
        .floating-actions {
          position: sticky;
          bottom: 12px;
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          padding: 0 12px;
        }

        .fab {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .fab.primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .fab.secondary {
          background: #10b981;
          color: white;
        }

        .fab:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }

        .fab:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          animation: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .business-sidebar {
            margin: 6px;
            border-radius: 10px;
          }
          
          .header-gradient {
            padding: 12px;
          }
          
          .business-name {
            font-size: 14px;
          }
          
          .status-badge {
            font-size: 10px;
            padding: 3px 6px;
          }
          
          .tab-content {
            padding: 10px;
          }
          
          .contact-full-width-card {
            margin: 0 -10px;
            width: calc(100% + 20px);
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
          
          .designation-text-full {
            font-size: 11px;
          }
          
          .contact-name-text-full {
            font-size: 13px;
          }
          
          .detail-value-full {
            font-size: 11px;
          }
          
          .quick-actions-compact {
            flex-direction: row;
          }
          
          .action-btn-compact {
            min-height: 36px;
          }
          
          .action-text-compact {
            font-size: 9px;
          }
          
          .floating-actions {
            position: fixed;
            bottom: 12px;
            right: 12px;
            flex-direction: column;
          }
          
          .fab {
            width: 36px;
            height: 36px;
            font-size: 13px;
          }
          
          .modal-content {
            max-height: 70vh;
          }
        }

        @media (max-width: 480px) {
          .tab-navigation {
            padding: 0 6px;
          }
          
          .tab-btn {
            font-size: 9px;
            padding: 6px 2px;
            min-height: 38px;
          }
          
          .address-actions {
            flex-direction: row;
          }
          
          .contact-detail-card {
            padding: 8px 12px;
            min-height: 44px;
          }
          
          .detail-icon-full {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
          
          .detail-action-btn {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
          
          .slider-controls {
            flex-direction: row;
            gap: 6px;
          }
          
          .slider-info {
            order: 2;
          }
          
          .slider-nav-btn {
            order: 1;
            width: 24px;
            height: 24px;
            font-size: 10px;
          }
          
          .designation-header-full {
            flex-direction: row;
            gap: 4px;
            padding: 10px 12px;
          }
          
          .contact-name-full {
            flex-direction: row;
            padding: 10px 12px 4px 12px;
          }
          
          .contact-title-full {
            font-size: 10px;
          }
          
          .contact-name-text-full {
            font-size: 12px;
          }
          
          .fab {
            width: 34px;
            height: 34px;
            font-size: 12px;
          }
        }

        @media (max-width: 360px) {
          .business-name {
            font-size: 13px;
          }
          
          .tab-text {
            font-size: 9px;
          }
          
          .contact-detail-card {
            padding: 6px 10px;
          }
          
          .detail-label-full {
            font-size: 9px;
          }
          
          .detail-value-full {
            font-size: 10px;
          }
          
          .quick-actions-compact {
            padding: 8px 10px;
            gap: 6px;
          }
          
          .action-btn-compact {
            padding: 6px 4px;
            min-height: 34px;
          }
          
          .action-text-compact {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  )
}