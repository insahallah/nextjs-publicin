'use client'
import { API_ENDPOINTS2 } from '@/configs/api';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  name: string
  address: string
  image: string
  profileScore: number
  category: string
  city: string
  status: string
  created_at: string
  mobile: string
  building_name: string
  street: string
  landmark: string
  district_name: string
  village: string
  pin_code: string
  image_path: string
  category_id: string
  subcategory_id: string
  childcategory_id: string
  parent_category_data?: any
  sub_category_data?: any
  child_category_data?: any
  category_data?: any
  business_name?: string
}

interface ApiBusiness {
  id: number
  business_name: string
  address: string
  profile_score: number
  category: string
  city: string
  status: string
  created_at: string
  mobile: string
  building_name: string
  street: string
  landmark: string
  district_name: string
  village: string
  pin_code: string
  category_id: number
  subcategory_id: number
  childcategory_id?: number
  images: Array<{
    image_path: string
    full_url: string
  }>
  image_count: number
  primary_image: string
  parent_category_data?: any
  sub_category_data?: any
  child_category_data?: any
  category_data?: any
}

interface ApiResponse {
  success: boolean
  data: ApiBusiness[]
  message: string
  count: number
}

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  const formatAddress = (business: ApiBusiness): string => {
    const addressParts = [
      business.building_name,
      business.street,
      business.landmark,
      business.village,
      business.district_name,
      business.pin_code ? `PIN: ${business.pin_code}` : ''
    ].filter(part => part && part.toString().trim() !== '')

    return addressParts.join(', ') || business.address || 'Address not provided'
  }

  const formatCreatedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date not available';
    }
  }

  const getBusinessImage = (business: ApiBusiness): string => {
    if (business.primary_image && business.primary_image !== 'null') {
      return business.primary_image
    }

    if (business.images && business.images.length > 0) {
      return business.images[0].full_url
    }

    return getDefaultImage(business.category_id)
  }

  const getDefaultImage = (categoryId: number): string => {
    const categoryImages: { [key: string]: string } = {
      '1': 'https://images.jdmagicbox.com/comp/def_content/computer_training_institutes/default-computer-training-institutes-0.jpg',
      '2': 'https://images.jdmagicbox.com/comp/def_content/electronics_stores/default-electronics-stores-1.jpg',
      '3': 'https://images.jdmagicbox.com/comp/def_content/medical_stores/default-medical-stores-2.jpg',
      '4': 'https://images.jdmagicbox.com/comp/def_content/restaurants/default-restaurants-3.jpg',
      '5': 'https://images.jdmagicbox.com/comp/def_content/boutiques/default-boutiques-4.jpg',
      '14': 'https://images.jdmagicbox.com/comp/def_content/businesses/default-businesses-1.jpg',
      '29': 'https://images.jdmagicbox.com/comp/def_content/businesses/default-businesses-2.jpg',
      '369': 'https://images.jdmagicbox.com/comp/def_content/businesses/default-businesses-0.jpg',
    }
    return categoryImages[categoryId.toString()] || 'https://images.jdmagicbox.com/comp/def_content/businesses/default-businesses-0.jpg'
  }

  const calculateProfileScore = (business: ApiBusiness): number => {
    if (business.profile_score && business.profile_score > 0) {
      return business.profile_score
    }

    let score = 0
    const fields = [
      'business_name',
      'building_name',
      'street',
      'landmark',
      'district_name',
      'village',
      'pin_code',
      'mobile',
      'category_id'
    ]

    fields.forEach(field => {
      const value = business[field as keyof ApiBusiness]
      if (value && value.toString().trim() !== '' && value.toString() !== '0') {
        score += 10
      }
    })

    if (business.images && business.images.length > 0) score += 10
    if (business.primary_image && business.primary_image !== 'null') score += 10

    return Math.min(score, 100)
  }

  const getCategoryPath = (business: ApiBusiness): string => {
    const parts = [];
    
    if (business.parent_category_data?.name) {
      parts.push(business.parent_category_data.name);
    }
    
    if (business.sub_category_data?.name) {
      parts.push(business.sub_category_data.name);
    }
    
    if (business.child_category_data?.subcategory_name) {
      parts.push(business.child_category_data.subcategory_name);
    }
    
    return parts.join(' > ');
  }

  const generateSlug = (text: string): string => {
    if (!text) return '';
    
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  const generateBusinessUrl = (business: Business): string => {
    const basePath = '/list';
    const businessId = business.id;
    
    const businessName = business.business_name || business.name;
    const businessNameSlug = generateSlug(businessName || `business-${businessId}`);
    
    let categoryPath = '';
    
    if (business.parent_category_data?.name) {
      categoryPath += `/${generateSlug(business.parent_category_data.name)}`;
    } else {
      categoryPath += '/business';
    }
    
    if (business.sub_category_data?.name) {
      categoryPath += `/${generateSlug(business.sub_category_data.name)}`;
    }
    
    if (business.child_category_data?.subcategory_name) {
      categoryPath += `/${generateSlug(business.child_category_data.subcategory_name)}`;
    }
    
    if (business.childcategory_id) {
      categoryPath += `/child${business.childcategory_id}`;
    } else if (business.subcategory_id) {
      categoryPath += `/sub${business.subcategory_id}`;
    } else if (business.category_id) {
      categoryPath += `/cat${business.category_id}`;
    } else {
      categoryPath += '/general';
    }
    
    return `${basePath}${categoryPath}/${businessNameSlug}/${businessId}`;
  }

  const handleBusinessClick = (business: Business) => {
    const url = generateBusinessUrl(business);
    router.push(url);
  }

  const getStatusText = (status: string): string => {
    if (typeof status === 'string') {
      return status
    }

    const statusMap: { [key: number]: string } = {
      1: 'Active',
      2: 'Pending',
      3: 'Rejected',
      4: 'Inactive'
    }
    return statusMap[status as unknown as number] || 'Unknown'
  }

  const fetchBusinessByUserId = async () => {
    try {
      setLoading(true);
      setError("");

      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("User not logged in");
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await fetch(
        `${API_ENDPOINTS2.AUTH.FETCH_BUSINESS_BY_USER_ID}?user_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        const transformedBusinesses: Business[] = result.data.map(
          (business: ApiBusiness) => ({
            id: business.id?.toString() || "",
            name: business.business_name || `Business ${business.id}`,
            business_name: business.business_name,
            address: formatAddress(business),
            image: getBusinessImage(business),
            profileScore: calculateProfileScore(business),
            category: getCategoryPath(business),
            city:
              business.district_name ||
              business.village ||
              business.city ||
              "City not specified",
            status: getStatusText(business.status),
            created_at: business.created_at,
            mobile: business.mobile,
            building_name: business.building_name,
            street: business.street,
            landmark: business.landmark,
            district_name: business.district_name,
            village: business.village,
            pin_code: business.pin_code,
            image_path:
              business.primary_image ||
              business.images?.[0]?.image_path ||
              "",
            category_id: business.category_id
              ? business.category_id.toString()
              : "",
            subcategory_id: business.subcategory_id
              ? business.subcategory_id.toString()
              : "",
            childcategory_id: business.childcategory_id
              ? business.childcategory_id.toString()
              : "",
            parent_category_data: business.parent_category_data,
            sub_category_data: business.sub_category_data,
            child_category_data: business.child_category_data,
            category_data: business.category_data,
          })
        );

        setBusinesses(transformedBusinesses);
      } else {
        throw new Error(result.message || "No businesses found");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch businesses"
      );
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBusinessByUserId()
  }

  const handleAddNewBusiness = () => {
    window.location.href = '/list-your-business'
  }

  const handleEditBusiness = (businessId: string) => {
    // Add edit business functionality here
  }

  useEffect(() => {
    fetchBusinessByUserId()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#3b82f6'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
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
        <div className="loading-spinner">
          <div className="spinner"></div>
          Loading your businesses...
        </div>
      </div>
    )
  }

  if (error && businesses.length === 0) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Businesses</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="no-businesses">
        <div className="empty-state">
          <h3>No Businesses Found</h3>
          <p>You haven't created any business listings yet.</p>
          <button onClick={handleAddNewBusiness} className="btn-add-first-business">
            Add Your First Business
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="my-businesses-container">
      <div className="businesses-header">
        <div className="header-content">
          <h1 className="page-title">My Businesses</h1>
          <p className="page-subtitle">Manage and grow your business listings</p>
          <div className="header-actions">
            <button onClick={handleRefresh} className="btn-refresh">
              Refresh
            </button>
            <span className="business-count">{businesses.length} business{businesses.length !== 1 ? 'es' : ''}</span>
          </div>
        </div>
      </div>

      <div className="businesses-list">
        {businesses.map((business) => (
          <div key={business.id} className="jd_favli pointer">
            <div className="created-date-header">
              <div className="created-date-text">
                Created on: {formatCreatedDate(business.created_at)}
              </div>
            </div>

            <div className="business-main-content">
              <div className="business-image-section">
                <div 
                  className="imageZoom jd_fav_img clickable-element" 
                  onClick={() => handleBusinessClick(business)}
                >
                  <div className="imageZoom jd_fav_img">
                    <img
                      src={business.image}
                      alt={business.name}
                      width="140"
                      height="140"
                      onError={(e) => {
                        e.currentTarget.src = getDefaultImage(parseInt(business.category_id))
                      }}
                    />
                  </div>
                </div>

                <div className="jd_fav_content">
                  <div 
                    className="category-path font13 color666 mb-5 clickable-element"
                    onClick={() => handleBusinessClick(business)}
                  >
                    {business.category || "Business Category"}
                  </div>
                  
                  <div 
                    className="clickable-content"
                    onClick={() => handleBusinessClick(business)}
                  >
                    <div>
                      <div className="jd_fav_title font24 fw700 color111 mb-10 clickable-element">
                        {business.name}
                      </div>
                      <div className="jd_fav_address font15 color111 mb-10 clickable-element">{business.address}</div>
                    </div>
                  </div>

                  <div className="mybusiness_btnbox">
                    <button className="bluefill_animate mybusiness_button font14 fw500 colorFFF mr-15">
                      Advertise Now
                    </button>
                    <button
                      className="blue_whitefill_animate mybusiness_button font14 fw500 color007 mr-15"
                      onClick={() => handleEditBusiness(business.id)}
                    >
                      Edit Business Profile
                    </button>
                    <button className="blue_whitefill_animate mybusiness_button font14 fw500 color007 mr-15 dn">
                      Ratings
                    </button>
                    <button className="blue_whitefill_animate mybusiness_button font14 fw500 color007 mr-10">
                      Upload Catalogue
                      <span className="headnav_tagm font8 fw700 colorFFF text_uppercase mr-4 ml-10">Free</span>
                      <span className="button_flare"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pscore">
                <div className="score-circle-container">
                  <svg height="80" width="80" className="score-circle">
                    <circle
                      cx="40"
                      cy="40"
                      r="38"
                      strokeWidth="4px"
                      className="circle-bg"
                    />
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
                    <text
                      x="40"
                      y="45"
                      textAnchor="middle"
                      className="score-text"
                      fill="#000000"
                    >
                      {business.profileScore}%
                    </text>
                    <text
                      x="40"
                      y="60"
                      textAnchor="middle"
                      className="rating-text"
                      fill={getScoreColor(business.profileScore)}
                    >
                      {getScoreText(business.profileScore)}
                    </text>
                  </svg>
                </div>

                <button className="blue_whitefill_animate mybusiness_button font14 fw500 color007">
                  Increase Profile Score
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="add-business-footer">
        <button className="btn-add-new-business" onClick={handleAddNewBusiness}>
          <span className="add-icon">+</span>
          Add New Business
        </button>
      </div>

      <style jsx>{`
        .my-businesses-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .businesses-header {
          margin-bottom: 30px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .btn-refresh {
          padding: 8px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .btn-refresh:hover {
          background: #e2e8f0;
        }

        .business-count {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 16px;
          color: #6b7280;
        }

        .businesses-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .jd_favli {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          padding: 0;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }

        .jd_favli:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .pointer {
          cursor: pointer;
        }

        .created-date-header {
          background: #f8fafc;
          padding: 12px 20px;
          border-bottom: 1px solid #e5e7eb;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }

        .created-date-text {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          display: flex;
          align-items: center;
        }

        .created-date-text:before {
          content: "📅";
          margin-right: 8px;
          font-size: 14px;
        }

        .business-main-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          gap: 20px;
        }

        .business-image-section {
          display: flex;
          gap: 25px;
          flex: 1;
          align-items: flex-start;
        }

        .jd_fav_img {
          flex-shrink: 0;
        }

        .jd_fav_img img {
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
          width: 140px;
          height: 140px;
        }

        .imageZoom {
          transition: transform 0.3s ease;
        }

        .imageZoom:hover {
          transform: scale(1.05);
        }

        .jd_fav_content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .category-path {
          font-size: 13px;
          color: #666;
          margin-bottom: 5px;
          line-height: 1.3;
        }

        .clickable-element {
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .clickable-element:hover {
          color: #007bff;
        }

        .clickable-element:hover::after {
          content: "🔗";
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
        }

        .jd_fav_title.clickable-element:hover {
          color: #007bff;
        }

        .jd_fav_address.clickable-element:hover {
          color: #007bff;
        }

        .category-path.clickable-element:hover {
          color: #007bff;
        }

        .clickable-content {
          cursor: pointer;
        }

        .clickable-content:hover .jd_fav_title,
        .clickable-content:hover .jd_fav_address {
          color: #007bff;
        }

        .font13 { font-size: 13px; }
        .font24 { font-size: 24px; }
        .font15 { font-size: 15px; }
        .font14 { font-size: 14px; }
        .font8 { font-size: 8px; }
        .fw700 { font-weight: 700; }
        .fw500 { font-weight: 500; }
        .color111 { color: #111111; }
        .color666 { color: #666666; }
        .colorFFF { color: #ffffff; }
        .color007 { color: #007bff; }
        .mb-5 { margin-bottom: 5px; }
        .mb-10 { margin-bottom: 10px; }
        .mr-15 { margin-right: 15px; }
        .mr-10 { margin-right: 10px; }
        .mr-4 { margin-right: 4px; }
        .ml-10 { margin-left: 10px; }
        .dn { display: none; }
        .text_uppercase { text-transform: uppercase; }

        .mybusiness_btnbox {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-top: auto;
        }

        .mybusiness_button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
        }

        .bluefill_animate {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: 2px solid #007bff;
        }

        .bluefill_animate:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .blue_whitefill_animate {
          background: white;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .blue_whitefill_animate:hover {
          background: #007bff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .headnav_tagm {
          background: #10b981;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          line-height: 1;
        }

        .button_flare {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }

        .blue_whitefill_animate:hover .button_flare {
          left: 100%;
        }

        .pscore {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          flex-shrink: 0;
          width: 174px;
          margin-left: 20px;
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
          transform: rotate(90deg);
          transform-origin: 40px 40px;
        }

        .rating-text {
          font-size: 12px;
          font-weight: 700;
          transform: rotate(90deg);
          transform-origin: 40px 40px;
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
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          font-size: 18px;
          color: #64748b;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-left: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container, .no-businesses {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
        }

        .error-message, .empty-state {
          text-align: center;
          max-width: 400px;
        }

        .error-message h3, .empty-state h3 {
          color: #ef4444;
          margin-bottom: 10px;
        }

        .empty-state h3 {
          color: #6b7280;
        }

        .btn-retry, .btn-add-first-business {
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 15px;
          font-size: 14px;
        }

        .btn-add-first-business {
          background: #10b981;
        }

        .btn-retry:hover {
          background: #2563eb;
        }

        .btn-add-first-business:hover {
          background: #059669;
        }

        @media (max-width: 1024px) {
          .my-businesses-container {
            padding: 20px;
          }
          
          .business-main-content {
            gap: 15px;
          }
          
          .jd_fav_title {
            font-size: 18px;
          }
          
          .jd_fav_address {
            font-size: 13px;
          }

          .jd_fav_img img {
            width: 130px;
            height: 130px;
          }

          .category-path {
            font-size: 12px;
          }
        }

        @media (max-width: 768px) {
          .my-businesses-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .page-title {
            font-size: 24px;
          }

          .page-subtitle {
            font-size: 14px;
          }

          .business-main-content {
            flex-direction: column;
            gap: 25px;
            padding: 20px;
          }

          .business-image-section {
            flex-direction: column;
            text-align: center;
            gap: 20px;
            width: 100%;
            align-items: center;
          }

          .jd_fav_img {
            align-self: center;
            width: 100%;
            max-width: 300px;
          }

          .jd_fav_img img {
            width: 100%;
            height: auto;
            max-height: 250px;
            min-height: 200px;
          }

          .jd_fav_content {
            width: 100%;
          }

          .jd_fav_title {
            font-size: 18px;
            text-align: center;
            margin-bottom: 8px;
          }

          .jd_fav_address {
            font-size: 14px;
            text-align: center;
            margin-bottom: 20px;
          }

          .category-path {
            text-align: center;
            font-size: 12px;
          }

          .mybusiness_btnbox {
            justify-content: center;
            gap: 10px;
          }

          .mybusiness_button {
            font-size: 13px;
            padding: 8px 12px;
            min-height: 36px;
          }

          .pscore {
            width: 100%;
            align-items: center;
            margin-left: 0;
            border-top: 1px solid #e5e7eb;
            padding-top: 25px;
            gap: 12px;
          }

          .score-circle-container {
            transform: scale(1);
          }
        }

        @media (max-width: 640px) {
          .jd_fav_img {
            max-width: 100%;
          }

          .jd_fav_img img {
            max-height: 220px;
            min-height: 180px;
          }

          .jd_fav_title {
            font-size: 18px;
            text-align: center;
          }

          .jd_fav_address {
            font-size: 14px;
            text-align: center;
          }

          .category-path {
            font-size: 11px;
          }

          .mybusiness_btnbox {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .mybusiness_button {
            width: 100%;
            justify-content: center;
            margin-right: 0 !important;
            font-size: 14px;
            padding: 10px 16px;
          }

          .page-title {
            font-size: 22px;
          }

          .created-date-text {
            font-size: 11px;
            padding: 10px 15px;
          }

          .business-count {
            font-size: 13px;
          }

          .btn-refresh {
            padding: 6px 12px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .my-businesses-container {
            padding: 10px;
          }

          .businesses-header {
            margin-bottom: 20px;
          }

          .page-title {
            font-size: 20px;
          }

          .page-subtitle {
            font-size: 13px;
          }

          .businesses-list {
            gap: 15px;
          }

          .jd_favli {
            border-radius: 6px;
          }

          .business-main-content {
            padding: 15px;
          }

          .jd_fav_img img {
            max-height: 200px;
            min-height: 160px;
          }

          .jd_fav_title {
            font-size: 17px;
            margin-bottom: 6px;
          }

          .jd_fav_address {
            font-size: 13px;
            margin-bottom: 15px;
          }

          .category-path {
            font-size: 10px;
          }

          .mybusiness_button {
            font-size: 13px;
            padding: 9px 14px;
            min-height: 38px;
          }

          .headnav_tagm {
            font-size: 7px;
            padding: 1px 4px;
          }

          .pscore {
            padding-top: 20px;
          }

          .score-circle-container {
            transform: scale(0.9);
          }

          .created-date-text {
            font-size: 10px;
            padding: 8px 12px;
          }

          .add-business-footer {
            margin-top: 30px;
            padding-top: 20px;
          }

          .btn-add-new-business {
            padding: 10px 20px;
            font-size: 14px;
          }
        }

        @media (max-width: 360px) {
          .jd_fav_img img {
            max-height: 180px;
            min-height: 140px;
          }
          
          .jd_fav_title {
            font-size: 16px;
          }
          
          .jd_fav_address {
            font-size: 12px;
          }
          
          .category-path {
            font-size: 9px;
          }
          
          .mybusiness_button {
            font-size: 12px;
            padding: 8px 12px;
          }
          
          .page-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}