'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from "next/navigation";
import SubHeader from "@/components/SubHeader";
import Footer from "@/components/Footer";
import ListingsContainer from "@/components/ListingsContainer";
import ReviewModal from "@/components/ReviewModal";
import AwesomeLogin from "@/components/AwesomeLogin";
import AwesomeSignup from "@/components/AwesomeSignup";

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
  
  const router = useRouter();

  // Generate breadcrumb from slug array
  useEffect(() => {
    const generateBreadcrumb = async () => {
      try {
        const { slug } = await params;
        if (slug && Array.isArray(slug)) {
          const breadcrumbs = [];
          
          // Add Home as first breadcrumb
          breadcrumbs.push({ 
            path: '', 
            name: 'Home', 
            isClickable: true 
          });

          // Generate breadcrumbs from slug
          for (let i = 0; i < slug.length; i++) {
            const pathSegment = slug.slice(0, i + 1).join('/');
            const displayName = slug[i].split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            // Check if this is a business page (ends with numeric ID)
            const isBusinessPage = i === slug.length - 1 && /^\d+$/.test(slug[i]);
            
            // For category pages, only make clickable if it's not the last segment
            // For business pages, make all category segments clickable except the business ID
            const isClickable = !isBusinessPage && i < slug.length - 1;
            
            breadcrumbs.push({ 
              path: pathSegment, 
              name: displayName, 
              isClickable: isClickable
            });
          }
          
          setBreadcrumbPath(breadcrumbs);
          console.log('🍞 Breadcrumb Path:', breadcrumbs);
        }
      } catch (error) {
        console.error('Error generating breadcrumb:', error);
      }
    };

    generateBreadcrumb();
  }, [params]);

  // Listen for login events
  useEffect(() => {
    const handleOpenLoginModal = () => {
      console.log('✅ Login modal requested - Opening AwesomeLogin');
      setIsLoginModalOpen(true);
    };

    const handleUserLoggedIn = (event: any) => {
      console.log('✅ User logged in event received in ListPage:', event.detail);
      
      setTimeout(() => {
        const userId = getCurrentUserId();
        console.log('🎯 User ID after login event:', userId);
        
        if (userId) {
          console.log('✅ User is logged in, opening review modal');
          setIsLoginModalOpen(false);
          if (shouldReopenReviewAfterLogin && !isReviewModalOpen) {
            setTimeout(() => {
              setIsReviewModalOpen(true);
              setShouldReopenReviewAfterLogin(false);
            }, 500);
          }
        } else {
          console.log('❌ Still no user data found after login event');
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
  const handleAwesomeSignup = async (signupData: any) => {
    console.log('📝 Signup requested in ListPage:', signupData);
    alert('Signup functionality will be available soon! For now, please use login.');
    setShowRegisterModal(false);
    setIsLoginModalOpen(true);
  };

  // Handle login request from review modal
  const handleLoginRequest = () => {
    console.log('🔐 Login requested from review modal');
    setShouldReopenReviewAfterLogin(true);
    setIsLoginModalOpen(true);
  };

  // Robust method to get current user id from localStorage
  const getCurrentUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userDataStr = localStorage.getItem('userData');
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          console.log('🔍 getCurrentUserId - Found userData:', userData);
          
          if (userData?.id) {
            console.log('✅ User ID found:', userData.id);
            return String(userData.id);
          }
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      const authToken = localStorage.getItem('authToken');
      if (authToken && /^\d+$/.test(authToken)) {
        console.log('✅ Using authToken as ID:', authToken);
        return authToken;
      }
      
      console.log('❌ No user data found in getCurrentUserId');
      return null;
      
    } catch (error) {
      console.error('🚨 Error getting user ID:', error);
      return null;
    }
  };

  // Handle star rating click
  const handleStarClick = (rating: number, business: any = null) => {
    const userId = getCurrentUserId();
    
    if (userId) {
      console.log('✅ User logged in, opening review modal');
      setSelectedRating(rating);
      if (business) {
        setSelectedBusiness(business);
      }
      setIsReviewModalOpen(true);
      setShouldReopenReviewAfterLogin(false);
    } else {
      console.log('❌ User not logged in, opening login modal');
      setSelectedRating(rating);
      if (business) {
        setSelectedBusiness(business);
      }
      setShouldReopenReviewAfterLogin(true);
      setIsLoginModalOpen(true);
    }
  };

  // Review submit handler
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

    console.log("🚀 Final payload:", payload);

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

      console.log("📨 Response status:", res.status);

      let response: any = {};
      try {
        response = await res.json();
      } catch (jsonErr) {
        console.error("❌ Error parsing JSON response:", jsonErr);
        alert("Failed to submit review: Invalid server response");
        return;
      }

      console.log("📩 API Response:", response);

      if (!res.ok || response.status !== "success") {
        throw new Error(response.message || "Request failed");
      }

      alert("✅ Review submitted successfully!");
      closeReviewModal();
      
      // Refresh reviews after submitting new review
      if (businessData?.id) {
        fetchReviews(businessData.id);
      }
    } catch (err: any) {
      console.error("❌ Error submitting review:", err);
      alert("Failed to submit review: " + err.message);
    }
  };

  // Fetch reviews function
  const fetchReviews = async (businessId: string) => {
    try {
      setReviewsLoading(true);
      console.log('🔄 Fetching reviews for business ID:', businessId);
      
      const params = new URLSearchParams();
      params.append('business_id', businessId);

      const res = await fetch(
        `https://allupipay.in/publicsewa/api/users/get_reviews_for_one_bussiness.php?${params}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

      console.log('📝 Reviews API Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('📝 Reviews API Response data:', data);
        
        // Handle both response formats
        if (data && (data.status === "success" || data.reviews)) {
          const reviewsData = data.data || data.reviews || [];
          setReviews(reviewsData);
          console.log('✅ Reviews loaded:', reviewsData.length);
        } else {
          setReviews([]);
          console.log('ℹ️ No reviews found or API returned error');
        }
      } else {
        setReviews([]);
        console.log('❌ Failed to fetch reviews');
      }
    } catch (error) {
      console.error('🚨 Error fetching reviews:', error);
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

  // Handle successful login from AwesomeLogin
  const handleLoginSuccess = async (loginData: any) => {
    console.log('🎉 Login successful in ListPage - Data received:', loginData);
    
    try {
      const formData = new URLSearchParams();
      formData.append('mobile', loginData.mobile);
      formData.append('password', loginData.password);

      console.log('📤 Making login API call from ListPage...');

      const response = await fetch('https://allupipay.in/publicsewa/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      console.log('📥 Login response status:', response.status);
      const data = await response.json();
      console.log('📥 Login response data:', data);

      if (response.ok && data.status === 'success') {
        console.log('✅ LOGIN SUCCESSFUL in ListPage');

        localStorage.setItem('authToken', data.token || data.id);
        localStorage.setItem('userData', JSON.stringify({
          id: data.id,
          fullName: data.fullName || data.name || 'User',
          mobile: data.mobile,
          city: data.city,
          village: data.village,
          ...data
        }));

        console.log('💾 Data stored in localStorage');
        
        closeLoginModal();
        
        setTimeout(() => {
          const userId = getCurrentUserId();
          console.log('🎯 Final User ID check:', userId);
          
          if (userId && shouldReopenReviewAfterLogin) {
            console.log('✅ Opening review modal now');
            setIsReviewModalOpen(true);
            setShouldReopenReviewAfterLogin(false);
          }
        }, 500);
        
      } else {
        console.log('❌ Login failed in ListPage:', data.message);
        alert(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('🚨 Login error in ListPage:', error);
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

  // Navigation handlers
  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleBreadcrumbClick = (path: string, isClickable: boolean) => {
    if (!isClickable) return;
    
    console.log('🔄 Navigating to:', path);
    
    if (path === '') {
      // Home button
      router.push('/');
    } else {
      // Navigate to the category path - use the same structure as your app
      // This should match your Next.js dynamic routing
      router.push(`/${path}`);
    }
  };

  // For now, let's make a simpler version that only shows breadcrumb without clickable links
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

  // Determine if this is a category page or business details page
  useEffect(() => {
    const determinePageType = async () => {
      try {
        setLoading(true);
        const { slug } = await params;

        console.log('🔍 URL segments received:', slug);

        if (!slug || !Array.isArray(slug)) {
          console.log('❌ No slug or invalid slug');
          notFound();
          return;
        }

        // Check if this is a business details page
        if (slug.length >= 2) {
          const lastSegment = slug[slug.length - 1];
          const secondLastSegment = slug[slug.length - 2];

          console.log('🔍 Checking segments:', { lastSegment, secondLastSegment });

          // Check if last segment is a numeric ID (business ID)
          if (/^\d+$/.test(lastSegment)) {
            setPageType('business');
            const businessId = lastSegment;
            const businessName = secondLastSegment;
            const categorySlug = slug.slice(0, -2);

            console.log('🏢 Business page detected:', {
              businessId,
              businessName,
              categorySlug,
              fullSlug: slug
            });

            await fetchBusinessDetails(businessId, categorySlug);
            return;
          }
        }

        // Otherwise, it's a category listings page
        console.log('📁 Category page detected');
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
      console.log('🔄 Fetching DYNAMIC business details for ID:', businessId);

      const directBusinessData = await fetchBusinessDirectly(businessId);
      if (directBusinessData) {
        console.log('✅ Business found via direct API call');
        formatAndSetBusinessData(directBusinessData, categorySlug);
        return;
      }

      console.log('🔄 Trying category listings search...');
      const listingsData = await fetchListings(categorySlug);
      console.log('📊 Listings data received:', listingsData);

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
          console.log('✅ Business found in category listings');
          formatAndSetBusinessData(foundBusiness, categorySlug);
          return;
        }
      }

      console.log('🔄 Trying all categories search...');
      const allCategoriesBusiness = await searchAllCategoriesForBusiness(businessId);
      if (allCategoriesBusiness) {
        console.log('✅ Business found in all categories search');
        formatAndSetBusinessData(allCategoriesBusiness, categorySlug);
        return;
      }

      console.log('❌ Business not found in any data source');
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
            console.log(`✅ Business found in category: ${category.name}`);
            return foundBusiness;
          }
        } catch (error) {
          console.error(`Error searching in category ${category.name}:`, error);
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
      console.log('❌ No business data to format');
      notFound();
      return;
    }

    console.log('🔄 Formatting business data:', business);

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
      longitude: business.longitude
    };

    setBusinessData(businessDetails);

    const { name, location, area } = getCategoryInfoSync(categorySlug);
    setPageData({
      name: name || "Category",
      location: location || "Kisanpur",
      area: area || "Lakhisarai",
      categorySlug: categorySlug.join('/')
    });

    // Fetch reviews after setting business data
    if (businessDetails.id) {
      fetchReviews(businessDetails.id);
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

            {/* Simple Breadcrumb Navigation (Non-clickable) */}
            <SimpleBreadcrumb />
          </div>

          {/* Business Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Business Image with Action Buttons Below */}
              <div className="md:w-1/3">
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

                {/* Combined Action Buttons Section */}
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

              {/* Business Info */}
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

                {/* Location */}
                {businessData.location && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <span>📍</span>
                    <span>{businessData.location}</span>
                  </div>
                )}

                {/* Phone */}
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

                {/* Description */}
                {businessData.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">{businessData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services Section */}
          {businessData.services && businessData.services.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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

          {/* Rating & Review Section with Messages */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
                    {businessData.rating || 0}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < Math.floor(businessData.rating || 0) 
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
                            {/* User Avatar */}
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
                        
                        {/* Review Comment */}
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
        </main>

        <Footer />

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
                  console.log('🔄 Switching from login to signup modal');
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
                  console.log('🔄 Switching from signup to login modal');
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

            {/* Simple Breadcrumb Navigation (Non-clickable) */}
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
                console.log('🔄 Switching from login to signup modal');
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
                console.log('🔄 Switching from signup to login modal');
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