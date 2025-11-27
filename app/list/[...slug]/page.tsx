'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from "next/navigation";
import SubHeader from "@/components/SubHeader";
import Footer from "@/components/Footer";
import ListingsContainer from "@/components/ListingsContainer";
import ReviewModal from "@/components/ReviewModal";
import AwesomeLogin from "@/components/AwesomeLogin";
import AwesomeSignup from "@/components/AwesomeSignup";
import BusinessViewRightSideComponent from "@/components/BusinessViewRightSideComponent";

// Define interface for image objects
interface BusinessImage {
  id: string;
  url: string;
  title: string;
  alt: string;
  thumbnail?: string;
}

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
  const [breadcrumbPath, setBreadcrumbPath] = useState<{ path: string, name: string, isClickable: boolean }[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [extractedBusinessId, setExtractedBusinessId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [businessPhotos, setBusinessPhotos] = useState<BusinessImage[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!isMobile || !businessPhotos.length || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === businessPhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isMobile, businessPhotos.length, isAutoPlaying]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === businessPhotos.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? businessPhotos.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const container = document.querySelector('.zoom-container');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const maxX = (zoomLevel - 1) * containerRect.width / 2;
      const maxY = (zoomLevel - 1) * containerRect.height / 2;

      setPosition({
        x: Math.max(Math.min(newX, maxX), -maxX),
        y: Math.max(Math.min(newY, maxY), -maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isZoomed) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isZoomed || e.touches.length !== 1) return;

    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;

    const container = document.querySelector('.zoom-container');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const maxX = (zoomLevel - 1) * containerRect.width / 2;
      const maxY = (zoomLevel - 1) * containerRect.height / 2;

      setPosition({
        x: Math.max(Math.min(newX, maxX), -maxX),
        y: Math.max(Math.min(newY, maxY), -maxY)
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      zoomIn();
    } else {
      resetZoom();
    }
  };

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

  useEffect(() => {
    const extractBusinessIdFromParams = async () => {
      try {
        const { slug } = await params;

        if (slug && Array.isArray(slug) && slug.length >= 2) {
          const lastSegment = slug[slug.length - 1];

          if (/^\d+$/.test(lastSegment)) {
            const businessId = lastSegment;
            setExtractedBusinessId(businessId);
          }
        }
      } catch (error) {
        console.error('Error extracting business ID:', error);
      }
    };

    extractBusinessIdFromParams();
  }, [params]);

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

  const fetchBusinessPhotos = async (businessId: string) => {
    try {
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

      if (res.ok) {
        const data = await res.json();

        if (data && data.status === "success" && data.data && data.data.length > 0) {
          const photos = data.data.map((photo: any, index: number) => {
            const imageUrl = `https://allupipay.in/publicsewa/images/${photo.path}`;

            return {
              id: `photo-${photo.id}-${index}-${Date.now()}`,
              url: imageUrl,
              title: photo.title || `Business Photo ${index + 1}`,
              alt: photo.alt_text || businessData?.displayName || 'Business Photo',
              thumbnail: imageUrl
            };
          });

          setBusinessPhotos(photos);
        } else {
          setBusinessPhotos([]);
        }
      } else {
        setBusinessPhotos([]);
      }
    } catch (error) {
      console.error('Error in fetchBusinessPhotos:', error);
      setBusinessPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  const openPhotoModal = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsPhotoModalOpen(true);
    resetZoom();
    document.body.style.overflow = 'hidden';
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    resetZoom();
    document.body.style.overflow = 'auto';
  };

  const goToNextPhoto = () => {
    resetZoom();
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === businessPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevPhoto = () => {
    resetZoom();
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === 0 ? businessPhotos.length - 1 : prevIndex - 1
    );
  };

  const goToPhoto = (index: number) => {
    resetZoom();
    setCurrentPhotoIndex(index);
  };

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
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPhotoModalOpen, zoomLevel]);

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

  const handleAwesomeSignup = async (signupData: any) => {
    alert('Signup functionality will be available soon! For now, please use login.');
    setShowRegisterModal(false);
    setIsLoginModalOpen(true);
  };

  const handleLoginRequest = () => {
    setShouldReopenReviewAfterLogin(true);
    setIsLoginModalOpen(true);
  };

  const getCurrentUserId = (): string | null => {
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
  };

  const handleStarClick = (rating: number, business: any = null) => {
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
  };

  const handleSubmitReview = async (data: any) => {
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
  };

  const fetchReviews = async (businessId: string) => {
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
  };

  const openReviewModal = (business: any) => {
    setSelectedBusiness(business);
    setIsReviewModalOpen(true);
    setShouldReopenReviewAfterLogin(false);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedRating(0);
    setShouldReopenReviewAfterLogin(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setShouldReopenReviewAfterLogin(false);
  };

  const handleLoginSuccess = async (loginData: any) => {
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
  };

  const handleSearch = (query: string) => {
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
  };

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleBreadcrumbClick = (path: string, isClickable: boolean) => {
    if (!isClickable) return;

    if (path === '') {
      router.push('/');
    } else {
      router.push(`/${path}`);
    }
  };

  const SimpleBreadcrumb = () => {
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
  };

  const DesktopTabs = () => {
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
              className={`flex-1 py-4 px-2 text-center font-medium text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === tab.id
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
  };

  const MobileTabs = () => {
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
              className={`flex-1 py-4 px-2 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
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
  };

const OverviewTab = () => {
  const sliderImages = businessPhotos.length > 0
    ? businessPhotos
    : (businessData?.images && Array.isArray(businessData.images) && businessData.images.length > 0
      ? businessData.images.map((img: any, index: number) => ({
        id: `img-${index}`,
        url: typeof img === 'string' ? img : img.path ? `https://allupipay.in/publicsewa/images/${img.path}` : "/default-listing.jpg",
        title: `Business Image ${index + 1}`,
        alt: businessData.displayName
      }))
      : [{ id: 'default', url: "/default-listing.jpg", title: "Business Image", alt: businessData?.displayName }]
    );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 hidden md:block">
            <img
              src={businessData.images && businessData.images[0] ?
                (typeof businessData.images[0] === 'string' ?
                  businessData.images[0] :
                  businessData.images[0].path ?
                    `https://allupipay.in/publicsewa/images/${businessData.images[0].path}` :
                    "/default-listing.jpg"
                ) : "/default-listing.jpg"
              }
              alt={businessData.displayName}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                {businessData.phone ? (
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
                    if (businessData.latitude && businessData.longitude) {
                      const mapsUrl = `https://www.google.com/maps?q=${businessData.latitude},${businessData.longitude}`;
                      window.open(mapsUrl, '_blank');
                    } else if (businessData.location) {
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

          <div className="md:w-1/3 md:hidden">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <div className="relative h-64 w-full">
                {sliderImages.map((image: BusinessImage, index: number) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      onClick={() => openPhotoModal(index)}
                      onError={(e) => {
                        e.currentTarget.src = "/default-listing.jpg";
                      }}
                    />
                  </div>
                ))}

                {sliderImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-opacity-70 transition-all"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-opacity-70 transition-all"
                    >
                      ›
                    </button>
                  </>
                )}

                {sliderImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full z-10">
                    {currentImageIndex + 1} / {sliderImages.length}
                  </div>
                )}

                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-10">
                  Tap to view
                </div>
              </div>

              {sliderImages.length > 1 && (
                <div className="flex justify-center space-x-2 p-4">
                  {sliderImages.map((_: BusinessImage, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                          ? 'bg-blue-600 w-4'
                          : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                {businessData.phone ? (
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
                    if (businessData.latitude && businessData.longitude) {
                      const mapsUrl = `https://www.google.com/maps?q=${businessData.latitude},${businessData.longitude}`;
                      window.open(mapsUrl, '_blank');
                    } else if (businessData.location) {
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

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {businessData.displayName}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-lg ${i < Math.floor(businessData.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
                <span className="text-lg font-bold ml-2">{businessData.rating || 0}</span>
                <span className="text-gray-600">({businessData.reviewCount || 0} reviews)</span>
              </div>

              {businessData.isOpen ? (
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                  🟢 Open Now
                </span>
              ) : (
                <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                  🔴 Closed
                </span>
              )}
            </div>

            {businessData.location && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <span>📍</span>
                <span>{businessData.location}</span>
              </div>
            )}

            {businessData.phone ? (
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

            {businessData.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{businessData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {businessData.services && businessData.services.length > 0 && (
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
  );
};

  const PhotosTab = () => {
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
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {businessPhotos.length} photo{businessPhotos.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📷</span>
                <span>Click on any photo to view in full size</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {businessPhotos.map((photo: BusinessImage, index: number) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openPhotoModal(index)}
                >
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/default-listing.jpg";
                      }}
                    />
                  </div>

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
  };

  const PhotoModal = () => {
    if (!isPhotoModalOpen || businessPhotos.length === 0) return null;

    const currentPhoto = businessPhotos[currentPhotoIndex];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="relative w-full max-w-6xl max-h-full">
          <button
            onClick={closePhotoModal}
            className="absolute top-4 right-4 z-20 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
          >
            ✕
          </button>

          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black bg-opacity-50 rounded-lg p-2">
            <button
              onClick={zoomIn}
              disabled={zoomLevel >= 3}
              className="text-white text-xl bg-transparent p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              🔍+
            </button>
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= 1}
              className="text-white text-xl bg-transparent p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              🔍-
            </button>
            <button
              onClick={resetZoom}
              disabled={zoomLevel === 1}
              className="text-white text-lg bg-transparent p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset Zoom"
            >
              ⟳
            </button>
            <span className="text-white text-sm px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {businessPhotos.length > 1 && (
            <>
              <button
                onClick={goToPrevPhoto}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
              >
                ‹
              </button>
              <button
                onClick={goToNextPhoto}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-white text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
              >
                ›
              </button>
            </>
          )}

          <div
            className="flex items-center justify-center h-full zoom-container"
            onWheel={handleWheel}
          >
            <div
              className={`relative overflow-hidden ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
                transformOrigin: 'center center'
              }}
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

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 rounded-lg px-4 py-2 z-20">
            <div className="text-sm">
              {currentPhoto.title} • {currentPhotoIndex + 1} of {businessPhotos.length}
              {isZoomed && ` • Zoom: ${Math.round(zoomLevel * 100)}%`}
            </div>
          </div>

          {businessPhotos.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto py-2 z-20">
              {businessPhotos.map((photo: BusinessImage, index: number) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    goToPhoto(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all duration-200 ${index === currentPhotoIndex
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

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 rounded-lg px-3 py-1 hidden md:block z-20">
            Use ← → to navigate • +/- to zoom • ESC to close • Double-click to toggle zoom
          </div>

          {zoomLevel === 1 && (
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 rounded-lg px-3 py-1 text-center z-20">
              Double-click or use mouse wheel to zoom
            </div>
          )}
        </div>
      </div>
    );
  };

  const PriceListTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Price List</h3>

      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-gray-400 text-6xl mb-4">💰</div>
        <h4 className="text-lg font-medium text-gray-600 mb-2">Price List Coming Soon</h4>
        <p className="text-gray-500 max-w-md mx-auto">
          The business is working on updating their price list. Please contact them directly for current pricing information.
        </p>

        {businessData.phone && (
          <button
            onClick={() => window.open(`tel:${businessData.phone}`)}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Call for Pricing
          </button>
        )}
      </div>
    </div>
  );

  const QuickInfoTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Quick Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Basic Info</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Business Name</span>
              <span className="font-medium text-gray-800">{businessData.displayName}</span>
            </div>

            {businessData.contact_info?.contact_person_name && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Contact Person</span>
                <span className="font-medium text-gray-800">{businessData.contact_info.contact_person_name}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${businessData.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {businessData.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Rating</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-sm ${i < Math.floor(businessData.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
                <span>({businessData.reviewCount || 0})</span>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Contact Info</h4>

          <div className="space-y-3">
            {businessData.phone ? (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-800">{businessData.phone}</span>
              </div>
            ) : null}

            {businessData.contact_info?.email && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-800">{businessData.contact_info.email}</span>
              </div>
            )}

            {businessData.location && (
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600">Location</span>
                <span className="font-medium text-gray-800 text-right max-w-[200px]">{businessData.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {businessData.services && businessData.services.length > 0 && (
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
  );

  const ServicesTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Services & Offerings</h3>

      {businessData.services && businessData.services.length > 0 ? (
        <div className="space-y-6">
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

          {businessData.phone && (
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
  );

  const ReviewTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-xl mb-6">Rate & Review</h3>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              onClick={() => handleStarClick(i + 1, businessData)}
              className={`cursor-pointer text-5xl transition-all duration-200 transform hover:scale-110 ${i < selectedRating
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {businessData.rating || 0}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`text-xl ${i < Math.floor(businessData.rating || 0)
                      ? "text-yellow-500"
                      : "text-gray-300"
                    }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="text-gray-600 text-sm">
              ({businessData.reviewCount || 0} reviews)
            </div>
          </div>
        </div>

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
                              className={`text-sm ${i < Math.floor(review.rating || 0)
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
  );

const InfoTab = () => (
  <div className="lg:hidden">
    {extractedBusinessId && (
      <div className="bg-white rounded-lg shadow-lg">
        <BusinessViewRightSideComponent 
          businessId={extractedBusinessId} 
          key={extractedBusinessId} // Important for re-renders
        />
      </div>
    )}
  </div>
);

  const MobileReviewTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 lg:hidden">
      <h3 className="font-semibold text-xl mb-6">Rate & Review</h3>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              onClick={() => handleStarClick(i + 1, businessData)}
              className={`cursor-pointer text-5xl transition-all duration-200 transform hover:scale-110 ${i < selectedRating
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

      <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {businessData.rating || 0}
        </div>
        <div className="flex items-center justify-center gap-1 mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-xl ${i < Math.floor(businessData.rating || 0)
                  ? "text-yellow-500"
                  : "text-gray-300"
                }`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="text-gray-600 text-sm">
          ({businessData.reviewCount || 0} reviews)
        </div>
      </div>

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
                          className={`text-sm ${i < Math.floor(review.rating || 0)
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
  );

  useEffect(() => {
    const determinePageType = async () => {
      try {
        setLoading(true);
        const { slug } = await params;

        if (!slug || !Array.isArray(slug)) {
          notFound();
          return;
        }

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
      fetchBusinessPhotos(businessDetails.id);
    }
  };

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

  if (pageType === 'business' && businessData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <SubHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
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

            <SimpleBreadcrumb />
          </div>

          <DesktopTabs />

          <MobileTabs />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="lg:hidden">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'review' && <MobileReviewTab />}
                {activeTab === 'info' && <InfoTab />}
              </div>

              <div className="hidden lg:block space-y-6">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'photos' && <PhotosTab />}
                {activeTab === 'price-list' && <PriceListTab />}
                {activeTab === 'quick-info' && <QuickInfoTab />}
                {activeTab === 'services' && <ServicesTab />}
                {activeTab === 'reviews' && <ReviewTab />}
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-1">
              {extractedBusinessId && (
                <BusinessViewRightSideComponent businessId={extractedBusinessId} />
              )}
            </div>
          </div>
        </main>

        <Footer />

        <PhotoModal />

        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          onSubmit={handleSubmitReview}
          businessName={selectedBusiness?.displayName}
          businessImages={selectedBusiness?.images || []}
          onLoginRequest={handleLoginRequest}
          initialRating={selectedRating}
        />

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

  if (!pageData) return notFound();

  const { name, location, area, categoryIcon, categoryDescription, pageTitle } = pageData;
  const fallbackImage = "/default-listing.jpg";

  return (
    <div id="page" className="bg-gray-50 min-h-screen">
      <SubHeader />
      <main className="theia-exception">
        <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
          <div className="mb-6 px-4">
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
