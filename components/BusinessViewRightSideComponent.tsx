'use client'
import { API_ENDPOINTS2 } from '@/configs/api';
import { useState, useEffect } from 'react'

interface BusinessTiming {
  open: string
  close: string
  closed: boolean
}

interface ContactInfo {
  contact_person_name?: string
  alternate_mobile?: string
  whatsapp_number?: string
  email?: string
}

interface BusinessData {
  mobile?: string
  address?: string
  contact_info?: ContactInfo
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

  // Automatic animation states
  const [autoCallAnimation, setAutoCallAnimation] = useState(false)
  const [autoWhatsAppAnimation, setAutoWhatsAppAnimation] = useState(false)

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
          contact_info: {
            contact_person_name: 'Not specified',
            email: 'Not available'
          },
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

  const handleGetDirections = () => {
    if (businessData?.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessData.address)}`
      window.open(mapsUrl, '_blank')
    } else if (businessData?.latitude && businessData?.longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${businessData.latitude},${businessData.longitude}`
      window.open(mapsUrl, '_blank')
    }
  }

  const handleCall = () => {
    if (businessData?.mobile) {
      window.open(`tel:${businessData.mobile}`, '_self')
    }
  }

  const handleWhatsApp = () => {
    const phone = businessData?.mobile || businessData?.contact_info?.whatsapp_number
    if (phone) {
      const message = `Hello! I'm interested in your services. Could you please provide more information?`
      const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleShare = async () => {
    const businessName = businessData?.business_name || businessData?.contact_info?.contact_person_name || 'Business'
    
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

  const handleEmail = () => {
    if (businessData?.contact_info?.email) {
      window.open(`mailto:${businessData.contact_info.email}`, '_blank')
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
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid #e8e8e8;
            overflow: hidden;
          }
          
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 8px;
          }
          
          .business-name-skeleton {
            height: 24px;
            width: 70%;
            margin-bottom: 10px;
          }
          
          .status-skeleton {
            height: 20px;
            width: 80px;
          }
          
          .tab-skeleton {
            height: 50px;
            flex: 1;
            margin: 0 5px;
          }
          
          .content-skeleton {
            height: 20px;
            margin-bottom: 10px;
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
          <h3>Unable to Load Business Information</h3>
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
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid #e8e8e8;
            padding: 40px 20px;
            text-align: center;
          }
          
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          
          h3 {
            color: #ef4444;
            margin: 0 0 8px 0;
            font-size: 18px;
          }
          
          p {
            color: #6b7280;
            margin-bottom: 20px;
            font-size: 14px;
          }
          
          .retry-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
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
              {businessData?.business_name || businessData?.contact_info?.contact_person_name || 'Business Details'}
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
          Contact
        </button>
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <span className="tab-icon">ℹ️</span>
          Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          <span className="tab-icon">🕒</span>
          Hours
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="tab-panel">
            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className={`action-btn primary ${autoCallAnimation ? 'auto-shake-animation' : ''}`} 
                onClick={handleCall}
                disabled={!businessData?.mobile}
              >
                <span className="action-icon">📞</span>
                Call Now
              </button>
              <button 
                className={`action-btn secondary ${autoWhatsAppAnimation ? 'auto-shake-animation' : ''}`} 
                onClick={handleWhatsApp}
                disabled={!businessData?.mobile && !businessData?.contact_info?.whatsapp_number}
              >
                <span className="action-icon">💬</span>
                WhatsApp
              </button>
            </div>

            {/* Contact Details */}
            <div className="contact-section">
              <div className="contact-item">
                <div className="contact-icon">📱</div>
                <div className="contact-info">
                  <span className="contact-label">Mobile</span>
                  <span className="contact-value">
                    {businessData?.mobile || 'Not available'}
                  </span>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">👤</div>
                <div className="contact-info">
                  <span className="contact-label">Contact Person</span>
                  <span className="contact-value">
                    {businessData?.contact_info?.contact_person_name || 'Not specified'}
                  </span>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div className="contact-info">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">
                    {businessData?.contact_info?.email || 'Not available'}
                  </span>
                </div>
              </div>

              {/* Alternate Mobile */}
              {businessData?.contact_info?.alternate_mobile && (
                <div className="contact-item">
                  <div className="contact-icon">📱</div>
                  <div className="contact-info">
                    <span className="contact-label">Alternate Mobile</span>
                    <span className="contact-value">
                      {businessData.contact_info.alternate_mobile}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Address Section */}
            <div className="address-section">
              <h3 className="section-title">
                <span className="section-icon">📍</span>
                Address
              </h3>
              <p className="address-text">
                {businessData?.address || 'Address not available'}
              </p>
              <div className="address-actions">
                <button 
                  className="address-btn" 
                  onClick={handleGetDirections}
                  disabled={!businessData?.address && !businessData?.latitude}
                >
                  <span className="btn-icon">🗺️</span>
                  Get Directions
                </button>
                <button 
                  className="address-btn" 
                  onClick={handleCopyAddress}
                  disabled={!businessData?.address}
                >
                  <span className="btn-icon">{copied ? '✅' : '📋'}</span>
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="tab-panel">
            {/* Business Information */}
            <div className="info-section">
              <div className="info-card">
                <h3 className="info-title">Business Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`info-value ${isOpenToday ? 'open' : 'closed'}`}>
                      {isOpenToday ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">GSTIN</span>
                    <span className="info-value">
                      {businessData?.gstin || 'Not Available'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Website</span>
                    <span 
                      className={`info-value ${businessData?.website ? 'link' : ''}`}
                      onClick={businessData?.website ? handleWebsite : undefined}
                    >
                      {businessData?.website || 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="action-grid">
                <button className="action-card" onClick={handleShare}>
                  <div className="action-card-icon">🔗</div>
                  <span className="action-card-text">Share</span>
                </button>
                
                <button className="action-card">
                  <div className="action-card-icon">⭐</div>
                  <span className="action-card-text">Rate</span>
                </button>
                
                <button className="action-card">
                  <div className="action-card-icon">📝</div>
                  <span className="action-card-text">Edit</span>
                </button>
                
                <button 
                  className="action-card" 
                  onClick={handleEmail}
                  disabled={!businessData?.contact_info?.email}
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
              <h3 className="section-title">Today's Hours</h3>
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
              <h3 className="section-title">Business Hours</h3>
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
              
              <button className="suggest-timing-btn">
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
          onClick={handleCall}
          disabled={!businessData?.mobile}
        >
          📞
        </button>
        <button 
          className={`fab secondary ${autoWhatsAppAnimation ? 'auto-shake-animation' : ''}`} 
          onClick={handleWhatsApp}
          disabled={!businessData?.mobile && !businessData?.contact_info?.whatsapp_number}
        >
          💬
        </button>
      </div>

      <style jsx>{`
        .business-sidebar {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e8e8e8;
          overflow: hidden;
          position: relative;
        }

        /* Header Styles */
        .sidebar-header {
          position: relative;
        }

        .header-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 25px 20px;
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
          background-size: 10px 10px;
          opacity: 0.3;
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .business-name {
          color: white;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 10px 0;
          line-height: 1.3;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
        }

        .status-badge.open {
          background: rgba(34, 197, 94, 0.9);
        }

        .status-badge.closed {
          background: rgba(239, 68, 68, 0.9);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Automatic Shake Animation */
        .auto-shake-animation {
          animation: autoShake 2s ease-in-out;
        }

        @keyframes autoShake {
          0%, 100% { 
            transform: translateX(0) rotate(0) scale(1);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
          2%, 18% { 
            transform: translateX(-3px) rotate(-3deg) scale(1.05);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
          }
          4%, 16% { 
            transform: translateX(3px) rotate(3deg) scale(1.05);
          }
          6%, 14% { 
            transform: translateX(-2px) rotate(-2deg) scale(1.03);
          }
          8%, 12% { 
            transform: translateX(2px) rotate(2deg) scale(1.03);
          }
          10% { 
            transform: translateX(0) rotate(0) scale(1.05);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
          }
        }

        /* Enhanced Icon Animation for Auto-shake */
        .action-btn.auto-shake-animation .action-icon,
        .fab.auto-shake-animation {
          animation: autoIconPulse 2s ease-in-out;
        }

        @keyframes autoIconPulse {
          0%, 100% { 
            transform: scale(1);
          }
          10%, 30%, 50%, 70%, 90% { 
            transform: scale(1.2) rotate(5deg);
          }
          20%, 40%, 60%, 80% { 
            transform: scale(1.2) rotate(-5deg);
          }
        }

        /* Continuous subtle animation when not shaking */
        .action-btn:not(:disabled) .action-icon,
        .fab:not(:disabled) {
          animation: subtleGlow 4s ease-in-out infinite;
        }

        @keyframes subtleGlow {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5);
          }
        }

        .action-btn.secondary:not(:disabled) .action-icon,
        .fab.secondary:not(:disabled) {
          animation: subtleGlowGreen 4s ease-in-out infinite;
        }

        @keyframes subtleGlowGreen {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.5);
          }
        }

        /* Tab Navigation */
        .tab-navigation {
          display: flex;
          background: #f8fafc;
          padding: 0 15px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px 10px;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
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
          height: 3px;
          background: #3b82f6;
          border-radius: 3px 3px 0 0;
        }

        .tab-icon {
          font-size: 16px;
        }

        /* Tab Content */
        .tab-content {
          padding: 20px;
        }

        .tab-panel {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .action-btn.secondary {
          background: #10b981;
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .action-btn.secondary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          animation: none;
        }

        .action-btn:disabled .action-icon {
          animation: none;
        }

        .action-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
        }

        /* Contact Section */
        .contact-section {
          margin-bottom: 25px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .contact-item:last-child {
          border-bottom: none;
        }

        .contact-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 10px;
          font-size: 18px;
        }

        .contact-info {
          flex: 1;
        }

        .contact-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .contact-value {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        /* Address Section */
        .address-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 12px 0;
        }

        .section-icon {
          font-size: 18px;
        }

        .address-text {
          font-size: 14px;
          line-height: 1.5;
          color: #475569;
          margin-bottom: 15px;
        }

        .address-actions {
          display: flex;
          gap: 10px;
        }

        .address-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .address-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-1px);
        }

        .address-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 14px;
        }

        /* Info Section */
        .info-section {
          space-y-20;
        }

        .info-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .info-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 15px 0;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-size: 14px;
          color: #64748b;
        }

        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
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
        }

        .info-value.link:hover {
          text-decoration: underline;
        }

        /* Action Grid */
        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 15px 10px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-card:hover:not(:disabled) {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .action-card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .action-card-icon {
          font-size: 20px;
        }

        .action-card-text {
          font-size: 12px;
          font-weight: 500;
          color: #475569;
        }

        /* Hours Section */
        .today-timing {
          margin-bottom: 25px;
        }

        .timing-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 15px;
          border-left: 4px solid #e2e8f0;
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
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
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

        /* Timing List */
        .all-timings {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
        }

        .timing-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .timing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .timing-item.today {
          background: white;
          margin: 0 -10px;
          padding: 8px 10px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .day {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .today-badge {
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .time {
          font-size: 14px;
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
          gap: 8px;
          padding: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .suggest-timing-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        /* Floating Actions */
        .floating-actions {
          position: sticky;
          bottom: 20px;
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
          padding: 0 20px;
        }

        .fab {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
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
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .fab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          animation: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .business-sidebar {
            margin: 10px;
            border-radius: 15px;
          }
          
          .header-gradient {
            padding: 20px 15px;
          }
          
          .business-name {
            font-size: 18px;
          }
          
          .tab-content {
            padding: 15px;
          }
          
          .quick-actions {
            flex-direction: column;
          }
          
          .action-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .floating-actions {
            position: fixed;
            bottom: 20px;
            right: 20px;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .tab-navigation {
            padding: 0 10px;
          }
          
          .tab-btn {
            font-size: 12px;
            padding: 12px 5px;
          }
          
          .address-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}