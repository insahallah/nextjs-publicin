'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter } from "next/navigation";
import SubHeader from "@/components/SubHeader";
import Footer from "@/components/Footer";
import ListingsContainer from "@/components/ListingsContainer";
import ReviewModal from "@/components/ReviewModal";
import AwesomeLogin from "@/components/AwesomeLogin";
import AwesomeSignup from "@/components/AwesomeSignup";
import BusinessViewRightSideComponent from "@/components/BusinessViewRightSideComponent";

/**
 * ListPage Component
 * - Handles both category listings and business details pages
 * - All data is dynamic from API
 */
export default function ListPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldReopenReviewAfterLogin, setShouldReopenReviewAfterLogin] = useState(false);
  const [pageType, setPageType] = useState<'category' | 'business'>('category');
  const [businessData, setBusinessData] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<{path: string, name: string, isClickable: boolean}[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [extractedBusinessId, setExtractedBusinessId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [businessPhotos, setBusinessPhotos] = useState<any[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  
  // Image Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Photo Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Zoom State for Photo Modal
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const router = useRouter();

  // Image Slider Auto-play Effect - FIXED: Only run when relevant dependencies change
  useEffect(() => {
    if (!isAutoPlaying || !businessPhotos.length || !isMobile) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === businessPhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, businessPhotos.length, isMobile]);

  // Pause auto-play when user interacts with slider
  const handleSliderInteraction = useCallback(() => {
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  // Image Slider Navigation Functions - FIXED: useCallback se wrap kiya
  const goToNextImage = useCallback(() => {
    handleSliderInteraction();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === businessPhotos.length - 1 ? 0 : prevIndex + 1
    );
  }, [businessPhotos.length, handleSliderInteraction]);

  const goToPrevImage = useCallback(() => {
    handleSliderInteraction();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? businessPhotos.length - 1 : prevIndex - 1
    );
  }, [businessPhotos.length, handleSliderInteraction]);

  const goToImage = useCallback((index: number) => {
    handleSliderInteraction();
    setCurrentImageIndex(index);
  }, [handleSliderInteraction]);

  // Responsive check - Set default tab based on screen size - FIXED: useCallback added
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile && !['overview', 'review', 'info'].includes(activeTab)) {
        setActiveTab('overview');
      }
      else if (!mobile && !['overview', 'photos', 'price-list', 'quick-info', 'services', 'reviews'].includes(activeTab)) {
        setActiveTab('overview');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [activeTab]);

  // Add this useEffect to extract business ID from URL
  useEffect(() => {
    const extractBusinessIdFromParams = async () => {
      try {
        const { slug } = await params;
        
        if (slug && Array.isArray(slug) && slug.length >= 2) {
          const lastSegment = slug[slug.length - 1];
          
          if (/^\d+$/.test(lastSegment)) {
            const businessId = lastSegment;
            setExtractedBusinessId(businessId);
            console.log('🎯 Extracted Business ID:', businessId);
          }
        }
      } catch (error) {
        console.error('Error extracting business ID:', error);
      }
    };

    extractBusinessIdFromParams();
  }, [params]);

  // Generate breadcrumb from slug array
  useEffect(() => {
    const generateBreadcrumb = async () => {
      try {
        const { slug } = await params;
        if (slug && Array.isArray(slug)) {
          const breadcrumbs = [];
          
          breadcrumbs.push({ 
            path: '', 
            name: 'Home', 
            isClickable: true 
          });

          for (let i = 0; i < slug.length; i++) {
            const pathSegment = slug.slice(0, i + 1).join('/');
            const displayName = slug[i].split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            const isBusinessPage = i === slug.length - 1 && /^\d+$/.test(slug[i]);
            const isClickable = !isBusinessPage && i < slug.length - 1;
            
            breadcrumbs.push({ 
              path: pathSegment, 
              name: displayName, 
              isClickable: isClickable
            });
          }
          
          setBreadcrumbPath(breadcrumbs);
        }
      } catch (error) {
        console.error('Error generating breadcrumb:', error);
      }
    };

    generateBreadcrumb();
  }, [params]);

  // ✅ CORRECTED: Fetch business photos - FIXED VERSION with useCallback
  const fetchBusinessPhotos = useCallback(async (businessId: string) => {
    try {
      console.log('🚀 START fetchBusinessPhotos for:', businessId);
      setPhotosLoading(true);

      const formData = new FormData();
      formData.append('business_id', businessId);

      const res = await fetch(
        "https://allupipay.in/publicsewa/api/users/get-multi-business-photos_by_id.php",
        {
          method: "POST",
          body: formData,
          cache: "no-store"
        }
      );

      console.log('📥 API Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('📄 Full API response:', data);
        
        if (data && data.status === "success" && data.data && data.data.length > 0) {
          console.log('✅ API success, photos found:', data.data.length);
          
          // ✅ CORRECTED: Proper mapping with unique IDs
          const photos = data.data.map((photo: any, index: number) => {
            const imageUrl = `https://allupipay.in/publicsewa/images/${photo.path}`;
            
            return {
              id: `photo-${photo.id}-${index}-${Date.now()}`, // ✅ Unique ID
              url: imageUrl,
              title: photo.title || `Business Photo ${index + 1}`,
              alt: photo.alt_text || businessData?.displayName || 'Business Photo',
              thumbnail: imageUrl
            };
          });
          
          console.log('📸 Setting business photos:', photos.length);
          setBusinessPhotos(photos);
        } else {
          console.log('❌ No photos in API response');
          setBusinessPhotos([]);
        }
      } else {
        console.log('❌ API request failed');
        setBusinessPhotos([]);
      }
    } catch (error) {
      console.error('💥 Error in fetchBusinessPhotos:', error);
      setBusinessPhotos([]);
    } finally {
      console.log('🏁 fetchBusinessPhotos completed');
      setPhotosLoading(false);
    }
  }, [businessData?.displayName]);

  // Helper function for default photo
  const getDefaultPhoto = useCallback((businessData: any) => ({
    id: 1,
    url: "/default-listing.jpg",
    title: "Business Photo",
    alt: businessData?.displayName || 'Business',
    thumbnail: "/default-listing.jpg"
  }), []);

  // ✅ CORRECTED: Photos persistence - Load photos when business data is set - FIXED: Added proper dependencies
  useEffect(() => {
    if (businessData?.id) {
      console.log('🎯 Business data loaded, fetching photos for:', businessData.id);
      fetchBusinessPhotos(businessData.id);
    }
  }, [businessData?.id, fetchBusinessPhotos]);

  // Photo Modal Functions - FIXED: useCallback added
  const openPhotoModal = useCallback((index: number) => {
    setCurrentPhotoIndex(index);
    setIsPhotoModalOpen(true);
    setZoomLevel(1); // Reset zoom when opening modal
    setPosition({ x: 0, y: 0 }); // Reset position
    document.body.style.overflow = 'hidden';
  }, []);

  const closePhotoModal = useCallback(() => {
    setIsPhotoModalOpen(false);
    setZoomLevel(1); // Reset zoom when closing
    setPosition({ x: 0, y: 0 }); // Reset position
    document.body.style.overflow = 'auto';
  }, []);

  const goToNextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === businessPhotos.length - 1 ? 0 : prevIndex + 1
    );
    setZoomLevel(1); // Reset zoom when changing photos
    setPosition({ x: 0, y: 0 }); // Reset position
  }, [businessPhotos.length]);

  const goToPrevPhoto = useCallback(() => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === 0 ? businessPhotos.length - 1 : prevIndex - 1
    );
    setZoomLevel(1); // Reset zoom when changing photos
    setPosition({ x: 0, y: 0 }); // Reset position
  }, [businessPhotos.length]);

  const goToPhoto = useCallback((index: number) => {
    setCurrentPhotoIndex(index);
    setZoomLevel(1); // Reset zoom when changing photos
    setPosition({ x: 0, y: 0 }); // Reset position
  }, []);

  // Zoom Functions
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3)); // Max zoom 3x
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1)); // Min zoom 1x
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Double click to toggle zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (zoomLevel === 1) {
      setZoomLevel(2);
      // Center the zoom on click position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.width / 2 - e.clientX + rect.left) * 0.5;
      const y = (rect.height / 2 - e.clientY + rect.top) * 0.5;
      setPosition({ x, y });
    } else {
      handleZoomReset();
    }
  }, [zoomLevel, handleZoomReset]);

  // Drag to pan when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [zoomLevel, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, zoomLevel, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  }, [zoomLevel, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  }, [isDragging, zoomLevel, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pinch to zoom for touch devices
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  const handleTouchStartPinch = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      setLastTouchDistance(distance);
    }
  }, []);

  const handleTouchMovePinch = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );

      if (lastTouchDistance > 0) {
        const zoomChange = (distance - lastTouchDistance) * 0.01;
        setZoomLevel(prev => Math.max(1, Math.min(prev + zoomChange, 3)));
      }
      setLastTouchDistance(distance);
    }
  }, [lastTouchDistance]);

  // Handle keyboard navigation - FIXED: Added proper dependencies
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPhotoModalOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closePhotoModal();
          break;
        case 'ArrowLeft':
          goToPrevPhoto();
          break;
        case 'ArrowRight':
          goToNextPhoto();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleZoomReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPhotoModalOpen, closePhotoModal, goToPrevPhoto, goToNextPhoto, handleZoomIn, handleZoomOut, handleZoomReset]);

  // Listen for login events - FIXED: Added proper dependencies
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    const handleUserLoggedIn = (event: any) => {
      setTimeout(() => {
        const userId = getCurrentUserId();
        
        if (userId) {
          setIsLoginModalOpen(false);
          if (shouldReopenReviewAfterLogin && !isReviewModalOpen) {
            setTimeout(() => {
              setIsReviewModalOpen(true);
              setShouldReopenReviewAfterLogin(false);
            }, 500);
          }
        }
      }, 300);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, [shouldReopenReviewAfterLogin, isReviewModalOpen]);

  // Handle signup
  const handleAwesomeSignup = useCallback(async (signupData: any) => {
    alert('Signup functionality will be available soon! For now, please use login.');
    setShowRegisterModal(false);
    setIsLoginModalOpen(true);
  }, []);

  // Handle login request from review modal
  const handleLoginRequest = useCallback(() => {
    setShouldReopenReviewAfterLogin(true);
    setIsLoginModalOpen(true);
  }, []);

  // Robust method to get current user id from localStorage
  const getCurrentUserId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userDataStr = localStorage.getItem('userData');
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          
          if (userData?.id) {
            return String(userData.id);
          }
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      const authToken = localStorage.getItem('authToken');
      if (authToken && /^\d+$/.test(authToken)) {
        return authToken;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }, []);

  // Handle star rating click
  const handleStarClick = useCallback((rating: number, business: any = null) => {
    const userId = getCurrentUserId();
    
    if (userId) {
      setSelectedRating(rating);
      if (business) {
        setSelectedBusiness(business);
      }
      setIsReviewModalOpen(true);
      setShouldReopenReviewAfterLogin(false);
    } else {
      setSelectedRating(rating);
      if (business) {
        setSelectedBusiness(business);
      }
      setShouldReopenReviewAfterLogin(true);
      setIsLoginModalOpen(true);
    }
  }, [getCurrentUserId]);

  // Review submit handler
  const handleSubmitReview = useCallback(async (data: any) => {
    const userId = getCurrentUserId();
    if (!userId) {
      alert("Please log in to submit a review!");
      setShouldReopenReviewAfterLogin(true);
      setIsLoginModalOpen(true);
      return;
    }

    if (!selectedBusiness?.id) {
      alert("No business selected for review!");
      return;
    }

    const payload = {
      user_id: userId.toString(),
      business_id: selectedBusiness.id.toString(),
      rating: data.rating?.toString() || "0",
      review: data.comment || "",
    };

    try {
      const res = await fetch(
        "https://allupipay.in/publicsewa/api/users/submit_review.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      let response: any = {};
      try {
        response = await res.json();
      } catch (jsonErr) {
        console.error("Error parsing JSON response:", jsonErr);
        alert("Failed to submit review: Invalid server response");
        return;
      }

      if (!res.ok || response.status !== "success") {
        throw new Error(response.message || "Request failed");
      }

      alert("✅ Review submitted successfully!");
      closeReviewModal();
      
      if (businessData?.id) {
        fetchReviews(businessData.id);
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review: " + err.message);
    }
  }, [getCurrentUserId, selectedBusiness, businessData?.id]);

  // Fetch reviews function - FIXED: useCallback added
  const fetchReviews = useCallback(async (businessId: string) => {
    try {
      setReviewsLoading(true);
      
      const params = new URLSearchParams();
      params.append('business_id', businessId);

      const res = await fetch(
        `https://allupipay.in/publicsewa/api/users/get-reviews-for-one-business.php?${params}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

      if (res.ok) {
        const data = await res.json();
        
        if (data && (data.status === "success" || data.reviews)) {
          const reviewsData = data.data || data.reviews || [];
          setReviews(reviewsData);
        } else {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const openReviewModal = useCallback((business: any) => {
    setSelectedBusiness(business);
    setIsReviewModalOpen(true);
    setShouldReopenReviewAfterLogin(false);
  }, []);

  const closeReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setSelectedRating(0);
    setShouldReopenReviewAfterLogin(false);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setShouldReopenReviewAfterLogin(false);
  }, []);

  // Handle successful login from AwesomeLogin
  const handleLoginSuccess = useCallback(async (loginData: any) => {
    try {
      const formData = new FormData();
      formData.append('mobile', loginData.mobile);
      formData.append('password', loginData.password);

      const response = await fetch('https://allupipay.in/publicsewa/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        localStorage.setItem('authToken', data.token || data.id);
        localStorage.setItem('userData', JSON.stringify({
          id: data.id,
          fullName: data.fullName || data.name || 'User',
          mobile: data.mobile,
          city: data.city,
          village: data.village,
          ...data
        }));
        
        closeLoginModal();
        
        setTimeout(() => {
          const userId = getCurrentUserId();
          
          if (userId && shouldReopenReviewAfterLogin) {
            setIsReviewModalOpen(true);
            setShouldReopenReviewAfterLogin(false);
          }
        }, 500);
        
      } else {
        alert(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error in ListPage:', error);
      alert('Login failed. Please check your connection and try again.');
    }
  }, [closeLoginModal, getCurrentUserId, shouldReopenReviewAfterLogin]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredListings(listings);
      return;
    }
    const q = query.toLowerCase();
    const filtered = listings.filter(listing =>
      (listing.displayName || "").toLowerCase().includes(q) ||
      (listing.description || "").toLowerCase().includes(q) ||
      (listing.location || "").toLowerCase().includes(q) ||
      (Array.isArray(listing.services) && listing.services.some((s: string) => s.toLowerCase().includes(q)))
    );
    setFilteredListings(filtered);
  }, [listings]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleBreadcrumbClick = useCallback((path: string, isClickable: boolean) => {
    if (!isClickable) return;
    
    if (path === '') {
      router.push('/');
    } else {
      router.push(`/${path}`);
    }
  }, [router]);

  // Simple Breadcrumb Component - FIXED: useCallback se wrap kiya
  const SimpleBreadcrumb = useCallback(() => {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
        {breadcrumbPath.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">›</span>}
            <span className={index === breadcrumbPath.length - 1 ? 'text-gray-800 font-medium' : 'text-gray-600'}>
              {crumb.name}
            </span>
          </div>
        ))}
      </div>
    );
  }, [breadcrumbPath]);

  // Desktop Tabs Component - Main content ke under - FIXED: useCallback added
  const DesktopTabs = useCallback(() => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📋' },
      { id: 'photos', label: 'Photos', icon: '📷' },
      { id: 'price-list', label: 'Price List', icon: '💰' },
      { id: 'quick-info', label: 'Quick Info', icon: 'ℹ️' },
      { id: 'services', label: 'Services', icon: '🛠️' },
      { id: 'reviews', label: 'Reviews', icon: '⭐' }
    ];

    return (
      <div className="bg-white border-b border-gray-200 hidden lg:block">
        <div style={{ height: '63px' }} className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-2 text-center font-medium text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="font16 fw500 color111">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }, [activeTab]);

  // Mobile Tabs Component - FIXED: useCallback added
  const MobileTabs = useCallback(() => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📋' },
      { id: 'review', label: 'Review', icon: '⭐' },
      { id: 'info', label: 'Info', icon: 'ℹ️' }
    ];

    return (
      <div className="bg-white border-b border-gray-200 lg:hidden sticky top-0 z-10">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-2 text-center font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="block text-lg mb-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [activeTab]);

  // Image Slider Component for Mobile Overview - FIXED: useCallback se wrap kiya
  const MobileImageSlider = useCallback(() => {
    if (!businessPhotos.length) {
      return (
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <img
            src="/default-listing.jpg"
            alt={businessData?.displayName || 'Business'}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
        {/* Main Image */}
        <div className="relative w-full h-full">
          {businessPhotos.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                e.currentTarget.src = "/default-listing.jpg";
              }}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        {businessPhotos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200 z-10"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200 z-10"
            >
              ›
            </button>
          </>
        )}

        {/* Image Counter */}
        {businessPhotos.length > 1 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentImageIndex + 1} / {businessPhotos.length}
          </div>
        )}

        {/* Dots Indicator */}
        {businessPhotos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {businessPhotos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Auto-play Indicator */}
        {isAutoPlaying && businessPhotos.length > 1 && (
          <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full z-10 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Auto
          </div>
        )}
      </div>
    );
  }, [businessPhotos, currentImageIndex, isAutoPlaying, goToPrevImage, goToNextImage, goToImage, businessData?.displayName]);

  // Overview Tab Content - FIXED: useCallback added with null safety - NOW CLICKABLE IMAGES
  const OverviewTab = useCallback(() => (
    <div className="space-y-6">
      {/* Business Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Business Image - Mobile Slider / Desktop Single Image - NOW CLICKABLE */}
          <div className="md:w-1/3">
            {/* Mobile Image Slider - CLICKABLE */}
            <div className="lg:hidden">
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openPhotoModal(currentImageIndex)}
              >
                <MobileImageSlider />
              </div>
            </div>

            {/* Desktop Single Image - CLICKABLE */}
            <div className="hidden lg:block">
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openPhotoModal(0)}
              >
                <img
                  src={businessData?.images && businessData.images[0] ?
                    (typeof businessData.images[0] === 'string' ?
                      businessData.images[0] :
                      businessData.images[0].path ?
                        `https://allupipay.in/publicsewa/images/${businessData.images[0].path}` :
                        "/default-listing.jpg"
                    ) : "/default-listing.jpg"
                  }
                  alt={businessData?.displayName || 'Business'}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                {businessData?.phone ? (
                  <>
                    <button
                      onClick={() => window.open(`tel:${businessData.phone}`)}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-phone"></i>
                      Call Now
                    </button>

                    <button
                      onClick={() => {
                        const cleanPhone = businessData.phone.replace(/\D/g, '');
                        const message = `Hello ${businessData.displayName}!\n\nI found your business listing and I'm interested in your services. Could you please provide me with more information?\n\nThank you!`;
                        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      WhatsApp
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-3">
                    Phone number not available for contact
                  </div>
                )}

                <button
                  onClick={() => {
                    if (businessData?.latitude && businessData.longitude) {
                      const mapsUrl = `https://www.google.com/maps?q=${businessData.latitude},${businessData.longitude}`;
                      window.open(mapsUrl, '_blank');
                    } else if (businessData?.location) {
                      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessData.location)}`;
                      window.open(mapsUrl, '_blank');
                    } else {
                      alert('Location information not available');
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-map-marker-alt"></i>
                  Get Directions
                </button>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {businessData?.displayName || 'Business Name'}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-lg ${i < Math.floor(businessData?.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
                <span className="text-lg font-bold ml-2">{businessData?.rating || 0}</span>
                <span className="text-gray-600">({businessData?.reviewCount || 0} reviews)</span>
              </div>

              {businessData?.isOpen ? (
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                  🟢 Open Now
                </span>
              ) : (
                <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                  🔴 Closed
                </span>
              )}
            </div>

            {/* Location */}
            {businessData?.location && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <span>📍</span>
                <span>{businessData.location}</span>
              </div>
            )}

            {/* Phone */}
            {businessData?.phone ? (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <span>📞</span>
                <span>{businessData.phone}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <span>📞</span>
                <span>Phone number not available</span>
              </div>
            )}

            {/* Description */}
            {businessData?.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{businessData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Section */}
      {businessData?.services && businessData.services.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-xl mb-4">Services Offered</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {businessData.services.map((service: string, index: number) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-800 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ), [MobileImageSlider, businessData, openPhotoModal, currentImageIndex]);

  // ✅ CORRECTED: Photos Tab Content - STABLE VERSION - FIXED: useCallback added
  const PhotosTab = useCallback(() => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-xl mb-6">Business Photos</h3>
        
        {photosLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading photos...</p>
          </div>
        ) : businessPhotos.length > 0 ? (
          <div className="space-y-6">
            {/* Photo Count */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {businessPhotos.length} photo{businessPhotos.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📷</span>
                <span>Click on any photo to view in full size</span>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {businessPhotos.map((photo, index) => (
                <div 
                  key={photo.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openPhotoModal(index)}
                >
                  {/* Image Container */}
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('❌ Image load failed:', photo.url);
                        e.currentTarget.src = "/default-listing.jpg";
                      }}
                    />
                  </div>
                  
                  {/* Photo Info */}
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {photo.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Photo {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => openPhotoModal(0)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>👀</span>
                View All Photos in Gallery
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-6xl mb-4">📷</div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Photos Available</h4>
            <p className="text-gray-500 max-w-md mx-auto">
              This business hasn't uploaded any photos yet. Check back later for updates.
            </p>
          </div>
        )}
      </div>
    );
  }, [businessPhotos, photosLoading, openPhotoModal]);

  // Photo Modal Component - ZOOM FUNCTIONALITY KE SAATH
  const PhotoModal = useCallback(() => {
    if (!isPhotoModalOpen || businessPhotos.length === 0) return null;

    const currentPhoto = businessPhotos[currentPhotoIndex];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="relative w-full max-w-6xl max-h-full">
          {/* Close Button */}
          <button
            onClick={closePhotoModal}
            className="absolute top-4 right-4 z-10 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
          >
            ✕
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
              title="Zoom Out"
            >
              −
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleZoomReset}
                className="bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200 text-sm"
                title="Reset Zoom"
              >
                ⟲
              </button>
            )}
          </div>

          {/* Zoom Level Indicator */}
          {zoomLevel > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}

          {/* Navigation Arrows */}
          {businessPhotos.length > 1 && (
            <>
              <button
                onClick={goToPrevPhoto}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
              >
                ‹
              </button>
              <button
                onClick={goToNextPhoto}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
              >
                ›
              </button>
            </>
          )}

          {/* Main Image Container */}
          <div className="flex items-center justify-center h-full overflow-hidden">
            <div 
              className="relative"
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                handleTouchStart(e);
                handleTouchStartPinch(e);
              }}
              onTouchMove={(e) => {
                handleTouchMove(e);
                handleTouchMovePinch(e);
              }}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
            >
              <img
                src={currentPhoto.url}
                alt={currentPhoto.alt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg select-none"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = "/default-listing.jpg";
                }}
              />
            </div>
          </div>

          {/* Photo Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 rounded-lg px-4 py-2">
            <div className="text-sm">
              {currentPhoto.title} • {currentPhotoIndex + 1} of {businessPhotos.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {businessPhotos.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto py-2">
              {businessPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => goToPhoto(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all duration-200 ${
                    index === currentPhotoIndex 
                      ? 'border-blue-500 scale-110' 
                      : 'border-transparent hover:border-white'
                  }`}
                >
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/default-listing.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Shortcuts Info */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 rounded-lg px-3 py-1 hidden md:block">
            Use ← → to navigate • + - to zoom • Double-click to zoom • ESC to close
          </div>
        </div>
      </div>
    );
  }, [
    isPhotoModalOpen, 
    businessPhotos, 
    currentPhotoIndex, 
    closePhotoModal, 
    goToPrevPhoto, 
    goToNextPhoto, 
    goToPhoto,
    zoomLevel,
    position,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchStartPinch,
    handleTouchMovePinch,
    handleDoubleClick
  ]);

  // Price List Tab Content - FIXED: useCallback added with null safety
  const PriceListTab = useCallback(() => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Price List</h3>
      
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-gray-400 text-6xl mb-4">💰</div>
        <h4 className="text-lg font-medium text-gray-600 mb-2">Price List Coming Soon</h4>
        <p className="text-gray-500 max-w-md mx-auto">
          The business is working on updating their price list. Please contact them directly for current pricing information.
        </p>
        
        {businessData?.phone && (
          <button
            onClick={() => window.open(`tel:${businessData.phone}`)}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Call for Pricing
          </button>
        )}
      </div>
    </div>
  ), [businessData?.phone]);

  // Quick Info Tab Content - FIXED: useCallback added with null safety
  const QuickInfoTab = useCallback(() => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Quick Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Basic Info</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Business Name</span>
              <span className="font-medium text-gray-800">{businessData?.displayName || 'Business Name'}</span>
            </div>
            
            {businessData?.contact_info?.contact_person_name && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Contact Person</span>
                <span className="font-medium text-gray-800">{businessData.contact_info.contact_person_name}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${businessData?.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {businessData?.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Rating</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-sm ${i < Math.floor(businessData?.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
                <span>({businessData?.reviewCount || 0})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Contact Info</h4>
          
          <div className="space-y-3">
            {businessData?.phone ? (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-800">{businessData.phone}</span>
              </div>
            ) : null}
            
            {businessData?.contact_info?.email && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-800">{businessData.contact_info.email}</span>
              </div>
            )}
            
            {businessData?.location && (
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600">Location</span>
                <span className="font-medium text-gray-800 text-right max-w-[200px]">{businessData.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Summary */}
      {businessData?.services && businessData.services.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">Services Summary</h4>
          <div className="flex flex-wrap gap-2">
            {businessData.services.slice(0, 8).map((service: string, index: number) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {service}
              </span>
            ))}
            {businessData.services.length > 8 && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                +{businessData.services.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  ), [businessData]);

  // Services Tab Content - FIXED: useCallback added with null safety
  const ServicesTab = useCallback(() => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Services & Offerings</h3>
      
      {businessData?.services && businessData.services.length > 0 ? (
        <div className="space-y-6">
          {/* All Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessData.services.map((service: string, index: number) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                    🛠️
                  </div>
                  <h4 className="font-semibold text-gray-800 text-lg">{service}</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Professional {service.toLowerCase()} services with quality workmanship and timely completion.
                </p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                  Inquire About Service
                </button>
              </div>
            ))}
          </div>

          {/* Service Features */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-lg text-gray-800 mb-4">Why Choose Our Services?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl mx-auto mb-2">
                  ⭐
                </div>
                <p className="text-sm text-gray-600">Quality Work</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl mx-auto mb-2">
                  ⏱️
                </div>
                <p className="text-sm text-gray-600">Timely Service</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl mx-auto mb-2">
                  💰
                </div>
                <p className="text-sm text-gray-600">Fair Pricing</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl mx-auto mb-2">
                  🛡️
                </div>
                <p className="text-sm text-gray-600">Reliable Service</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">🛠️</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">Services Information Coming Soon</h4>
          <p className="text-gray-500 max-w-md mx-auto">
            The business is working on updating their service offerings. Please contact them directly to learn more about available services.
          </p>
          
          {businessData?.phone && (
            <button
              onClick={() => window.open(`tel:${businessData.phone}`)}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Call for Services Info
            </button>
          )}
        </div>
      )}
    </div>
  ), [businessData]);

  // Review Tab Content - Desktop version - FIXED: useCallback added with null safety
  const ReviewTab = useCallback(() => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Rate & Review</h3>

      {/* Big Star Rating */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              onClick={() => handleStarClick(i + 1, businessData)}
              className={`cursor-pointer text-5xl transition-all duration-200 transform hover:scale-110 ${
                i < selectedRating
                  ? "text-yellow-500 drop-shadow-lg"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-gray-600 text-lg font-medium">
          {selectedRating > 0 
            ? `You rated ${selectedRating} star${selectedRating > 1 ? 's' : ''}` 
            : 'Click stars to rate'
          }
        </span>
      </div>

      {/* Current Rating Display and Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Rating Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {businessData?.rating || 0}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`text-xl ${
                    i < Math.floor(businessData?.rating || 0) 
                      ? "text-yellow-500" 
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="text-gray-600 text-sm">
              ({businessData?.reviewCount || 0} reviews)
            </div>
          </div>
        </div>

        {/* Review Messages */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Customer Reviews</h4>
          
          {reviewsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {reviews.map((review, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.username || 'Anonymous User'}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(review.rating || 0) 
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-sm text-gray-500 ml-1">
                            {review.rating || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {review.created_at 
                        ? new Date(review.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Recently'
                      }
                    </div>
                  </div>
                  
                  {review.review && review.review.trim() !== '' ? (
                    <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                      "{review.review}"
                    </p>
                  ) : (
                    <p className="text-gray-500 italic bg-gray-50 rounded-lg p-3">
                      No comment provided
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Reviews Yet</h4>
              <p className="text-gray-500 max-w-md mx-auto">
                Be the first to share your experience with this business! Click the stars above to leave a review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  ), [businessData, selectedRating, reviewsLoading, reviews, handleStarClick]);

  // Info Tab Content - BusinessViewRightSideComponent show karein mobile me - FIXED: useCallback added
  const InfoTab = useCallback(() => (
    <div className="lg:hidden">
      {extractedBusinessId && (
        <div className="bg-white rounded-lg shadow-lg">
          <BusinessViewRightSideComponent businessId={extractedBusinessId} />
        </div>
      )}
    </div>
  ), [extractedBusinessId]);

  // Mobile Review Tab Content (simplified version) - FIXED: useCallback added with null safety
  const MobileReviewTab = useCallback(() => (
    <div className="bg-white rounded-lg shadow-lg p-6 lg:hidden">
      <h3 className="font-semibold text-xl mb-6">Rate & Review</h3>

      {/* Big Star Rating */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              onClick={() => handleStarClick(i + 1, businessData)}
              className={`cursor-pointer text-5xl transition-all duration-200 transform hover:scale-110 ${
                i < selectedRating
                  ? "text-yellow-500 drop-shadow-lg"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-gray-600 text-lg font-medium">
          {selectedRating > 0 
            ? `You rated ${selectedRating} star${selectedRating > 1 ? 's' : ''}` 
            : 'Click stars to rate'
          }
        </span>
      </div>

      {/* Current Rating Display */}
      <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {businessData?.rating || 0}
        </div>
        <div className="flex items-center justify-center gap-1 mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-xl ${
                i < Math.floor(businessData?.rating || 0) 
                  ? "text-yellow-500" 
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="text-gray-600 text-sm">
          ({businessData?.reviewCount || 0} reviews)
        </div>
      </div>

      {/* Review Messages */}
      <h4 className="font-semibold text-lg mb-4 text-gray-800">Customer Reviews</h4>
      
      {reviewsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.username || 'Anonymous User'}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(review.rating || 0) 
                              ? "text-yellow-500" 
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-500 ml-1">
                        {review.rating || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {review.created_at 
                    ? new Date(review.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Recently'
                  }
                </div>
              </div>
              
              {review.review && review.review.trim() !== '' ? (
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                  "{review.review}"
                </p>
              ) : (
                <p className="text-gray-500 italic bg-gray-50 rounded-lg p-3">
                  No comment provided
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Reviews Yet</h4>
          <p className="text-gray-500 max-w-md mx-auto">
            Be the first to share your experience with this business! Click the stars above to leave a review.
          </p>
        </div>
      )}
    </div>
  ), [businessData, selectedRating, reviewsLoading, reviews, handleStarClick]);

  // Determine if this is a category page or business details page
  useEffect(() => {
    const determinePageType = async () => {
      try {
        setLoading(true);
        const { slug } = await params;

        if (!slug || !Array.isArray(slug)) {
          notFound();
          return;
        }

        // Check if this is a business details page
        if (slug.length >= 2) {
          const lastSegment = slug[slug.length - 1];
          const secondLastSegment = slug[slug.length - 2];

          if (/^\d+$/.test(lastSegment)) {
            setPageType('business');
            const businessId = lastSegment;
            const businessName = secondLastSegment;
            const categorySlug = slug.slice(0, -2);

            await fetchBusinessDetails(businessId, categorySlug);
            return;
          }
        }

        setPageType('category');
        await fetchCategoryData(slug);

      } catch (error) {
        console.error('Error determining page type:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    determinePageType();
  }, [params]);

  // Fetch business details
  const fetchBusinessDetails = async (businessId: string, categorySlug: string[]) => {
    try {
      const directBusinessData = await fetchBusinessDirectly(businessId);
      if (directBusinessData) {
        formatAndSetBusinessData(directBusinessData, categorySlug);
        return;
      }

      const listingsData = await fetchListings(categorySlug);

      if (listingsData && listingsData.length > 0) {
        const foundBusiness = listingsData.find(listing => {
          const possibleIds = [
            listing.id,
            listing.business_id,
            listing.user_id,
            listing.businessId
          ];
          return possibleIds.some(id => id && String(id) === String(businessId));
        });

        if (foundBusiness) {
          formatAndSetBusinessData(foundBusiness, categorySlug);
          return;
        }
      }

      const allCategoriesBusiness = await searchAllCategoriesForBusiness(businessId);
      if (allCategoriesBusiness) {
        formatAndSetBusinessData(allCategoriesBusiness, categorySlug);
        return;
      }

      notFound();

    } catch (error) {
      console.error('Error fetching business details:', error);
      notFound();
    }
  };

  // METHOD 1: Fetch business directly by ID
  const fetchBusinessDirectly = async (businessId: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('business_id', businessId);

      const res = await fetch(
        "https://allupipay.in/publicsewa/api/users/get-business-by-id-for-web.php",
        {
          method: "POST",
          body: formData,
          cache: "no-store"
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.status === "success") {
          return data.data;
        }
      }

      const res2 = await fetch(
        `https://allupipay.in/publicsewa/api/users/business-details.php?id=${businessId}`,
        { cache: "no-store" }
      );

      if (res2.ok) {
        const data = await res2.json();
        if (data && data.status === "success") {
          return data.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error in direct business fetch:', error);
      return null;
    }
  };

  // METHOD 3: Search through all categories for the business
  const searchAllCategoriesForBusiness = async (businessId: string): Promise<any> => {
    try {
      const categories = await fetchAndFormatCategories();

      for (const category of categories.slice(0, 5)) {
        try {
          const categorySlug = category.fullPath.split('/');
          const listingsData = await fetchListings(categorySlug);

          const foundBusiness = listingsData.find(listing => {
            const possibleIds = [
              listing.id,
              listing.business_id,
              listing.user_id,
              listing.businessId
            ];
            return possibleIds.some(id => id && String(id) === String(businessId));
          });

          if (foundBusiness) {
            return foundBusiness;
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('Error in all categories search:', error);
      return null;
    }
  };

  // Format and set business data
  const formatAndSetBusinessData = (business: any, categorySlug: string[]) => {
    if (!business) {
      notFound();
      return;
    }

    const businessDetails = {
      ...business,
      id: business.id || business.business_id || business.user_id,
      displayName: business.businessName || business.displayName || business.name || "Business",
      location: [business.village, business.district, business.state].filter(Boolean).join(", ") || "Location not available",
      phone: business.mobile && business.mobile !== "Unknown" ? business.mobile : null,
      rating: business.averageRating || business.rating || 0,
      reviewCount: business.ratingCount || business.reviewCount || 0,
      services: business.services || [],
      images: business.images || [],
      isOpen: business.isOpen !== undefined ? business.isOpen : true,
      description: business.description || `Welcome to ${business.businessName || "our business"}. We provide quality services to our customers.`,
      latitude: business.latitude,
      longitude: business.longitude,
      contact_info: business.contact_info || {
        contact_person_name: business.contact_person_name || "Arman khan",
        email: business.email || "adminerr@gmail.com"
      },
      business_timing: business.business_timing || {
        mon: { open: "09:00", close: "18:00", closed: false },
        tue: { open: "09:00", close: "18:00", closed: false },
        wed: { open: "09:00", close: "18:00", closed: false },
        thu: { open: "09:00", close: "18:00", closed: false },
        fri: { open: "09:00", close: "18:00", closed: false },
        sat: { open: "09:00", close: "18:00", closed: false },
        sun: { open: "09:00", close: "18:00", closed: false }
      }
    };

    setBusinessData(businessDetails);

    const { name, location, area } = getCategoryInfoSync(categorySlug);
    setPageData({
      name: name || "Category",
      location: location || "Kisanpur",
      area: area || "Lakhisarai",
      categorySlug: categorySlug.join('/')
    });

    if (businessDetails.id) {
      fetchReviews(businessDetails.id);
      // Photos fetch karo business data set hone ke baad
      fetchBusinessPhotos(businessDetails.id);
    }
  };

  // Fetch category data
  const fetchCategoryData = async (slugArray: string[]) => {
    try {
      const { id, name, path } = await getCategoryInfo(slugArray);
      const { location, area } = getLocationInfo(slugArray);

      if (!id) {
        notFound();
        return;
      }

      const listingsData = await fetchListings(slugArray);

      const displayListings = listingsData.map((listing, index) => ({
        ...listing,
        images: getListingImagesFromAPI(listing),
        badge: getBadgeType(index),
        badgeColor: getBadgeColor(index),
        services: listing.services && listing.services.length > 0 ? listing.services : getDefaultServices(name, index)
      }));

      const categoryIcon = getCategoryIcon(name);
      const categoryDescription = getCategoryDescription(name, location, area);
      const pageTitle = `${name} in ${location}, ${area}`;

      setPageData({ id, name, path, location, area, categoryIcon, categoryDescription, pageTitle });
      setListings(displayListings);
      setFilteredListings(displayListings);
    } catch (error) {
      console.error('Error fetching category data:', error);
      notFound();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render business details page
  if (pageType === 'business' && businessData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <SubHeader />

        <main className="container mx-auto px-4 py-8">
          {/* Navigation Section */}
          <div className="mb-6">
            {/* Back and Home Buttons */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                ← Back
              </button>
              
              <button
                onClick={handleHome}
                className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
              >
                🏠 Home
              </button>
            </div>

            {/* Simple Breadcrumb Navigation */}
            <SimpleBreadcrumb />
          </div>

          {/* Desktop Tabs - Main content ke under */}
          <DesktopTabs />

          {/* Mobile Tabs */}
          <MobileTabs />

          {/* Main Business Content - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            {/* Left Column - Main Business Content (3/4 width on desktop) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Mobile View: Tab Content - OVERVIEW BY DEFAULT */}
              <div className="lg:hidden">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'review' && <MobileReviewTab />}
                {activeTab === 'info' && <InfoTab />}
              </div>

              {/* Desktop View: All tabs content */}
              <div className="hidden lg:block space-y-6">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'photos' && <PhotosTab />}
                {activeTab === 'price-list' && <PriceListTab />}
                {activeTab === 'quick-info' && <QuickInfoTab />}
                {activeTab === 'services' && <ServicesTab />}
                {activeTab === 'reviews' && <ReviewTab />}
              </div>
            </div>

            {/* Right Column - BusinessViewRightSideComponent (1/4 width on desktop) - Mobile me hidden */}
            <div className="hidden lg:block lg:col-span-1">
              {extractedBusinessId && (
                <BusinessViewRightSideComponent businessId={extractedBusinessId} />
              )}
            </div>
          </div>
        </main>

        <Footer />

        {/* Photo Modal with Zoom */}
        <PhotoModal />

        {/* Review Modal */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          onSubmit={handleSubmitReview}
          businessName={selectedBusiness?.displayName}
          businessImages={selectedBusiness?.images || []}
          onLoginRequest={handleLoginRequest}
          initialRating={selectedRating}
        />

        {/* Awesome Login Modal */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <AwesomeLogin
                onLogin={handleLoginSuccess}
                onSwitchToSignup={() => {
                  setIsLoginModalOpen(false);
                  setShowRegisterModal(true);
                }}
                onForgotPassword={() => {
                  alert('Password reset feature coming soon!');
                }}
                loading={false}
                className="awesome-auth-modal"
                showSocialLogin={false}
              />

              <div className="p-4 border-t">
                <button
                  onClick={closeLoginModal}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Awesome Signup Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <AwesomeSignup
                onSignup={handleAwesomeSignup}
                onSwitchToLogin={() => {
                  setShowRegisterModal(false);
                  setIsLoginModalOpen(true);
                }}
                loading={isRegistering}
                className="awesome-auth-modal"
                showSocialSignup={false}
              />

              <div className="p-4 border-t">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render category listings page
  if (!pageData) return notFound();

  const { name, location, area, categoryIcon, categoryDescription, pageTitle } = pageData;
  const fallbackImage = "/default-listing.jpg";

  return (
    <div id="page" className="bg-gray-50 min-h-screen">
      <SubHeader />
      <main className="theia-exception">
        <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
          {/* Navigation Section */}
          <div className="mb-6 px-4">
            {/* Back and Home Buttons */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                ← Back
              </button>
              
              <button
                onClick={handleHome}
                className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
              >
                🏠 Home
              </button>
            </div>

            {/* Simple Breadcrumb Navigation */}
            <SimpleBreadcrumb />
          </div>

          <ListingsContainer
            initialListings={filteredListings}
            categoryName={name}
            location={location}
            fallbackImage={fallbackImage}
            onOpenReviewModal={openReviewModal}
          />
        </div>
      </main>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        onSubmit={handleSubmitReview}
        businessName={selectedBusiness?.displayName}
        businessImages={selectedBusiness?.images || []}
        onLoginRequest={handleLoginRequest}
      />

      {/* Awesome Login Modal for category page */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <AwesomeLogin
              onLogin={handleLoginSuccess}
              onSwitchToSignup={() => {
                setIsLoginModalOpen(false);
                setShowRegisterModal(true);
              }}
              onForgotPassword={() => {
                alert('Password reset feature coming soon!');
              }}
              loading={false}
              className="awesome-auth-modal"
              showSocialLogin={false}
            />

            <div className="p-4 border-t">
              <button
                onClick={closeLoginModal}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Awesome Signup Modal for category page */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <AwesomeSignup
              onSignup={handleAwesomeSignup}
              onSwitchToLogin={() => {
                setShowRegisterModal(false);
                setIsLoginModalOpen(true);
              }}
              loading={isRegistering}
              className="awesome-auth-modal"
              showSocialSignup={false}
            />

            <div className="p-4 border-t">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* -------------------- HELPER FUNCTIONS -------------------- */

function getListingImagesFromAPI(listing: any): string[] {
  if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
    const validImagePaths = listing.images
      .filter((img: any) => img && img.path)
      .map((img: any) => getImageUrl(img.path));
    if (validImagePaths.length > 0) return validImagePaths;
  }
  if (listing.imageUrl) return [listing.imageUrl];
  return ["/default-listing.jpg"];
}

function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "/default-listing.jpg";
  if (imagePath.startsWith('post_images/')) return `https://allupipay.in/publicsewa/images/${imagePath}`;
  if (imagePath.startsWith('https://')) return imagePath;
  return `https://allupipay.in/publicsewa/images/${imagePath.replace(/^[\\/]+/, "")}`;
}

async function fetchAndFormatCategories(): Promise<{ fullPath: string; name: string }[]> {
  try {
    const res = await fetch("https://allupipay.in/publicsewa/api/main-search.php", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    const formattedCategories: { fullPath: string; name: string }[] = [];
    const categories = data?.data?.categories || [];
    categories.forEach((mainCat: any) => {
      if (!mainCat) return;
      const mainName = mainCat.category_name || mainCat.name || "Unknown Category";
      const mainSlug = mainCat.slug || mainName.toLowerCase().replace(/\s+/g, "-");
      const mainId = `cat${mainCat.id}`;
      const mainPath = `${mainSlug}/${mainId}`;
      formattedCategories.push({ fullPath: mainPath, name: mainName });

      (mainCat.subcategories || []).forEach((subCat: any) => {
        if (!subCat) return;
        const subName = subCat.subcategory_name || subCat.name || "Unknown Subcategory";
        const subSlug = subCat.slug || subName.toLowerCase().replace(/\s+/g, "-");
        const subId = `sub${subCat.id}`;
        const subPath = `${mainSlug}/${subSlug}/${subId}`;
        formattedCategories.push({ fullPath: subPath, name: subName });

        (subCat.child_categories || []).forEach((childCat: any) => {
          if (!childCat) return;
          const childName = childCat.child_name || childCat.name || "Unknown Child Category";
          const childSlug = childCat.slug || childName.toLowerCase().replace(/\s+/g, "-");
          const childId = `child${childCat.id}`;
          const childPath = `${mainSlug}/${subSlug}/${childSlug}/${childId}`;
          formattedCategories.push({ fullPath: childPath, name: childName });
        });
      });
    });
    return formattedCategories;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getCategoryInfo(slugArray: string[]) {
  const categories = await fetchAndFormatCategories();
  const path = slugArray.join("/");
  const category = categories.find((cat) => cat.fullPath === path);
  if (category) {
    const id = category.fullPath.split("/").pop() || "";
    return { id, name: category.name, path };
  }
  const id = slugArray.at(-1) || "";
  const nameSlug = slugArray.at(-2) || slugArray[0];
  const name = nameSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { id, name, path };
}

// Synchronous version for business details
function getCategoryInfoSync(slugArray: string[]) {
  const id = slugArray.at(-1) || "";
  const nameSlug = slugArray.at(-2) || slugArray[0];
  const name = nameSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const location = "Kisanpur";
  const area = "DefaultArea";

  return { id, name, path: slugArray.join("/"), location, area };
}

function getLocationInfo(slugArray: string[]) {
  const locationSlug = slugArray[0] || "kisanpur";
  const areaSlug = slugArray[1] || "lakhisarai";
  const location = locationSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const area = areaSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { location, area };
}

function getCategoryDescription(categoryName: string, location: string, area: string) {
  const descriptions: { [key: string]: string } = {
    "beauty parlours": `Discover the best beauty services and salons near you in ${location}, ${area}.`,
    "doctors": `Find top doctors and specialists in ${location}, ${area}.`,
    "hospitals": `Find top hospitals and healthcare centers in ${location}, ${area}.`,
    "restaurants": `Explore fine restaurants in ${location}, ${area}.`,
  };
  const lowerCategory = categoryName.toLowerCase();
  return descriptions[lowerCategory] || `Discover the best ${categoryName} services in ${location}, ${area}.`;
}

function getCategoryIcon(categoryName: string) {
  const icons: { [key: string]: string } = {
    "beauty parlours": "💄",
    "doctors": "👨‍⚕️",
    "hospitals": "🏥",
    "restaurants": "🍽️",
    "hotels": "🏨",
    "electricians": "⚡",
    "plumbers": "🔧",
    "carpenters": "🪚",
    "teachers": "👩‍🏫",
    "drivers": "🚗"
  };
  const lowerCategory = categoryName.toLowerCase();
  return icons[lowerCategory] || "🏢";
}

async function fetchListings(slugArray: string[]) {
  try {
    const lastPart = slugArray[slugArray.length - 1];
    const formData = new FormData();
    if (lastPart.startsWith("child")) formData.append("childrenId", lastPart);
    else if (lastPart.startsWith("sub")) formData.append("subcategoryId", lastPart);
    else if (lastPart.startsWith("cat")) formData.append("category", lastPart);

    const res = await fetch(
      "https://allupipay.in/publicsewa/api/users/main-search-display-request-for-web.php",
      { method: "POST", body: formData, cache: "no-store" }
    );

    if (!res.ok) return [];

    const data = await res.json();
    let listings: any[] = [];
    if (Array.isArray(data)) listings = data;
    else if (data?.data && Array.isArray(data.data)) listings = data.data;
    else listings = Object.values(data).flat().filter((v) => Array.isArray(v)).flat();

    return listings
      .filter((l) => l.status === 1)
      .map((l, index) => ({
        ...l,
        images: l.images || [],
        imageUrl: getImageUrl(l.images?.[0]?.path),
        rating: l.averageRating || 0,
        reviewCount: l.ratingCount || 0,
        displayName: l.businessName || "Service Provider",
        location: [l.village, l.district, l.state].filter(Boolean).join(", ") || "Location not available",
        phone: l.mobile && l.mobile !== "Unknown" ? l.mobile : null,
        services: l.services || [],
        respondsIn: "30 mins",
        distance: "0.5",
        isOpen: true,
      }));
  } catch (e) {
    console.error('Error fetching listings:', e);
    return [];
  }
}

function getBadgeType(index: number): string {
  const badges = ["Q Top Search", "Popular", "Trending", "Verified", "Best Rated"];
  return badges[index % badges.length];
}

function getBadgeColor(index: number): string {
  const colors = [
    "bg-green-100 text-green-800 border border-green-200",
    "bg-blue-100 text-blue-800 border border-blue-200",
    "bg-purple-100 text-purple-800 border border-purple-200",
    "bg-yellow-100 text-yellow-800 border border-yellow-200",
    "bg-red-100 text-red-800 border border-red-200"
  ];
  return colors[index % colors.length];
}

function getDefaultServices(categoryName: string, index: number): string[] {
  const serviceMap: { [key: string]: string[][] } = {
    "beauty parlours": [
      ["Bridal Makeup", "Hair Styling", "Skincare", "Mehndi"],
      ["Facial", "Threading", "Waxing", "Manicure"],
      ["Hair Color", "Spa", "Pedicure", "Makeover"],
      ["Hair Cut", "Facial Treatment", "Body Massage", "Nail Art"]
    ],
    "doctors": [
      ["General Consultation", "Health Checkup", "Prescription"],
      ["Specialist Consultation", "Diagnostic Tests", "Treatment"],
      ["Emergency Care", "Follow-up", "Medical Advice"]
    ],
    "restaurants": [
      ["Dine-in", "Takeaway", "Home Delivery"],
      ["Fine Dining", "Bar", "Outdoor Seating"],
      ["Buffet", "Family Dining", "Catering"]
    ]
  };

  const defaultServices = ["Service 1", "Service 2", "Service 3", "Professional Services"];
  const categoryServices = serviceMap[categoryName.toLowerCase()];
  return categoryServices ? categoryServices[index % categoryServices.length] : defaultServices;
}