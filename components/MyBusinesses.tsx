// components/MyBusinesses.tsx
'use client'

import { useState, useEffect } from 'react'

interface Business {
  id: string
  name: string
  address: string
  image: string
  profileScore: number
  category: string
  city: string
}

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  // Sample business data - aap isko real API se replace kar sakte hain
  const sampleBusinesses: Business[] = [
    {
      id: '1',
      name: 'Alisha Computer Center',
      address: 'Jamua, Giridih',
      image: 'https://images.jdmagicbox.com/comp/def_content/computer_training_institutes/default-computer-training-institutes-0.jpg',
      profileScore: 39,
      category: 'Computer Training Institute',
      city: 'Giridih'
    },
    {
      id: '2',
      name: 'Sharma Electronics',
      address: 'Main Road, Delhi',
      image: 'https://images.jdmagicbox.com/comp/def_content/electronics_stores/default-electronics-stores-1.jpg',
      profileScore: 65,
      category: 'Electronics Store',
      city: 'Delhi'
    },
    {
      id: '3',
      name: 'City Medical Store',
      address: 'Medical Road, Mumbai',
      image: 'https://images.jdmagicbox.com/comp/def_content/medical_stores/default-medical-stores-2.jpg',
      profileScore: 82,
      category: 'Medical Store',
      city: 'Mumbai'
    },
    {
      id: '4',
      name: 'Premium Restaurant',
      address: 'Food Street, Bangalore',
      image: 'https://images.jdmagicbox.com/comp/def_content/restaurants/default-restaurants-3.jpg',
      profileScore: 45,
      category: 'Restaurant',
      city: 'Bangalore'
    },
    {
      id: '5',
      name: 'Fashion Boutique',
      address: 'Mall Road, Chennai',
      image: 'https://images.jdmagicbox.com/comp/def_content/boutiques/default-boutiques-4.jpg',
      profileScore: 71,
      category: 'Fashion Boutique',
      city: 'Chennai'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBusinesses(sampleBusinesses)
      setLoading(false)
    }, 1000)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e' // Green
    if (score >= 60) return '#3b82f6' // Blue
    if (score >= 40) return '#f59e0b' // Yellow
    return '#ef4444' // Red
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const calculateStrokeDashoffset = (score: number) => {
    return 100 - score
  }

  if (loading) {
    return (
      <div className="loading-businesses">
        <div className="loading-spinner">Loading your businesses...</div>
      </div>
    )
  }

  return (
    <div className="my-businesses-container">
      <div className="businesses-header">
        <h1 className="page-title">My Businesses</h1>
        <p className="page-subtitle">Manage and grow your business listings</p>
      </div>

      <div className="businesses-list">
        {businesses.map((business) => (
          <div key={business.id} className="business-card">
            {/* Business Profile Score */}
            <div className="profile-score-header">
              Business Profile Score
            </div>

            <div className="business-content">
              {/* Business Image and Basic Info */}
              <div className="business-image-section">
                <div className="business-image">
                  <img 
                    src={business.image} 
                    alt={business.name}
                    width="120"
                    height="120"
                  />
                </div>
                <div className="business-info">
                  <div className="business-name">{business.name}</div>
                  <div className="business-address">{business.address}</div>
                  <div className="business-category">{business.category}</div>
                  
                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button className="btn-advertise">
                      Advertise Now
                    </button>
                    <button className="btn-edit">
                      Edit Business Profile
                    </button>
                    <button className="btn-ratings">
                      JD Ratings
                    </button>
                    <button className="btn-upload">
                      Upload Catalogue 
                      <span className="free-badge">Free</span>
                      <span className="button-flare"></span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Score Circle */}
              <div className="profile-score-section">
                <div className="score-circle-container">
                  <svg height="80" width="80" className="score-circle">
                    {/* Background Circle */}
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="38" 
                      strokeWidth="4px"
                      className="circle-bg"
                    />
                    {/* Progress Circle */}
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="38" 
                      fill="none"
                      strokeWidth="4px"
                      stroke={getScoreColor(business.profileScore)}
                      pathLength="100"
                      className="circle-progress"
                      style={{
                        strokeDashoffset: calculateStrokeDashoffset(business.profileScore)
                      }}
                    />
                    {/* Score Text */}
                    <text 
                      x="50%" 
                      y="45%" 
                      dy=".3em" 
                      textAnchor="middle"
                      className="score-text"
                    >
                      {business.profileScore}%
                    </text>
                    {/* Rating Text */}
                    <text 
                      x="50%" 
                      y="65%" 
                      dy=".3em" 
                      textAnchor="middle"
                      className="rating-text"
                      fill={getScoreColor(business.profileScore)}
                    >
                      {getScoreText(business.profileScore)}
                    </text>
                  </svg>
                </div>
                
                <button className="btn-increase-score">
                  Increase Profile Score
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Business Button */}
      <div className="add-business-footer">
        <button className="btn-add-new-business">
          <span className="add-icon">+</span>
          Add New Business
        </button>
      </div>

      <style jsx>{`
        .my-businesses-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .businesses-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 16px;
          color: #64748b;
        }

        .businesses-list {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .business-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .profile-score-header {
          background: #f8fafc;
          padding: 12px 20px;
          font-size: 12px;
          font-weight: 500;
          color: #111827;
          border-bottom: 1px solid #e2e8f0;
        }

        .business-content {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
        }

        .business-image-section {
          display: flex;
          gap: 20px;
          flex: 1;
        }

        .business-image {
          flex-shrink: 0;
        }

        .business-image img {
          border-radius: 8px;
          object-fit: cover;
        }

        .business-info {
          flex: 1;
        }

        .business-name {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 10px;
        }

        .business-address {
          font-size: 15px;
          color: #111827;
          margin-bottom: 8px;
        }

        .business-category {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: center;
        }

        .action-buttons button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-advertise {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .btn-advertise:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-edit, .btn-ratings, .btn-upload {
          background: white;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-edit:hover, .btn-ratings:hover, .btn-upload:hover {
          background: #007bff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-upload {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .free-badge {
          background: #10b981;
          color: white;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .button-flare {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }

        .btn-upload:hover .button-flare {
          left: 100%;
        }

        .profile-score-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          flex-shrink: 0;
        }

        .score-circle-container {
          text-align: center;
        }

        .score-circle {
          transform: rotate(-90deg);
        }

        .circle-bg {
          fill: none;
          stroke: #e4eaef;
        }

        .circle-progress {
          fill: none;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
        }

        .score-text {
          font-size: 20px;
          font-weight: 700;
          fill: #000000;
          transform: rotate(90deg);
          transform-origin: 40px 40px;
        }

        .rating-text {
          font-size: 12px;
          font-weight: 700;
          transform: rotate(90deg);
          transform-origin: 40px 40px;
        }

        .btn-increase-score {
          padding: 10px 16px;
          background: white;
          color: #007bff;
          border: 2px solid #007bff;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-increase-score:hover {
          background: #007bff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .add-business-footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-add-new-business {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add-new-business:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .add-icon {
          font-size: 20px;
          font-weight: bold;
        }

        .loading-businesses {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
        }

        .loading-spinner {
          font-size: 18px;
          color: #64748b;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .my-businesses-container {
            padding: 15px;
          }

          .business-content {
            flex-direction: column;
            gap: 20px;
          }

          .business-image-section {
            flex-direction: column;
            text-align: center;
          }

          .action-buttons {
            justify-content: center;
          }

          .business-name {
            font-size: 20px;
          }

          .page-title {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .action-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .action-buttons button {
            width: 100%;
            justify-content: center;
          }

          .business-name {
            font-size: 18px;
          }

          .page-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  )
}