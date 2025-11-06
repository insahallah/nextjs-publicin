'use client';

import { useState, useEffect } from 'react';
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingsContainer from "@/components/ListingsContainer";
import ReviewModal from "@/components/ReviewModal";

export default function ListPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldReopenReviewAfterLogin, setShouldReopenReviewAfterLogin] = useState(false);

  // ✅ FIXED: Listen for login success to auto-open review modal
  useEffect(() => {
    console.log('🔄 Parent: Setting up userLoggedIn event listener');
    
    const handleUserLoggedIn = (event: any) => {
      console.log('🎯 Parent: userLoggedIn event received', {
        shouldReopenReviewAfterLogin,
        isReviewModalOpen,
        eventDetail: event.detail
      });
      
      if (shouldReopenReviewAfterLogin && !isReviewModalOpen) {
        console.log('🔄 Parent: Auto-opening review modal after login');
        
        // Multiple delays for reliability
        setTimeout(() => {
          console.log('✅ Parent: Setting review modal open to TRUE');
          setIsReviewModalOpen(true);
          setShouldReopenReviewAfterLogin(false);
        }, 1000);
      } else {
        console.log('❌ Parent: Not reopening - conditions not met', {
          shouldReopenReviewAfterLogin,
          isReviewModalOpen
        });
      }
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    
    return () => {
      console.log('🧹 Parent: Cleaning up userLoggedIn event listener');
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, [shouldReopenReviewAfterLogin, isReviewModalOpen]);

  // ✅ Handle login request from ReviewModal
  const handleLoginRequest = () => {
    console.log('🔄 Parent: Login requested from ReviewModal');
    setShouldReopenReviewAfterLogin(true);
  };

  // Review submit handler
  const handleSubmitReview = async (reviewData: any) => {
    try {
      console.log('📝 Submitting review for:', selectedBusiness?.displayName);
      const response = await fetch('https://allupipay.in/publicsewa/api/submit_review.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: selectedBusiness?.id,
          businessName: selectedBusiness?.displayName,
          ...reviewData
        }),
      });
      
      if (response.ok) {
        alert('Review submitted successfully!');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      alert('Error submitting review. Please try again.');
      throw error;
    }
  };

  // Function to open review modal
  const openReviewModal = (business: any) => {
    console.log('🔓 Parent: Manually opening review modal for:', business?.displayName);
    setSelectedBusiness(business);
    setIsReviewModalOpen(true);
    setShouldReopenReviewAfterLogin(false);
  };

  // Function to close review modal
  const closeReviewModal = () => {
    console.log('❌ Parent: Closing review modal');
    setIsReviewModalOpen(false);
    setShouldReopenReviewAfterLogin(false);
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredListings(listings);
    } else {
      const filtered = listings.filter(listing =>
        listing.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        listing.description?.toLowerCase().includes(query.toLowerCase()) ||
        listing.location?.toLowerCase().includes(query.toLowerCase()) ||
        listing.services?.some((service: string) => 
          service.toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredListings(filtered);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { slug } = await params;
        
        if (!slug || !Array.isArray(slug)) {
          notFound();
          return;
        }

        const { id, name, path } = await getCategoryInfo(slug);
        const { location, area } = getLocationInfo(slug);

        if (!id) {
          notFound();
          return;
        }

        // Fetch listings
        const listingsData = await fetchListings(slug);
        
        // Generate dynamic content
        const categoryIcon = getCategoryIcon(name);
        const categoryDescription = getCategoryDescription(name, location, area);
        const pageTitle = `${name} in ${location}, ${area}`;

        // Process listings with images
        const displayListings = listingsData.map((listing, index) => ({ 
          ...listing, 
          images: getListingImagesFromAPI(listing),
          badge: getBadgeType(index),
          badgeColor: getBadgeColor(index),
          services: listing.services && listing.services.length > 0 ? listing.services : getDefaultServices(name, index)
        }));

        setPageData({
          id, name, path, location, area,
          categoryIcon, categoryDescription, pageTitle
        });
        setListings(displayListings);
        setFilteredListings(displayListings);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  // Debug current state
  useEffect(() => {
    console.log('🔍 Parent State:', {
      isReviewModalOpen,
      shouldReopenReviewAfterLogin,
      selectedBusiness: selectedBusiness?.displayName
    });
  }, [isReviewModalOpen, shouldReopenReviewAfterLogin, selectedBusiness]);

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

  if (!pageData) {
    return notFound();
  }

  const { name, location, area, categoryIcon, categoryDescription, pageTitle } = pageData;
  const fallbackImage = "/default-listing.jpg";

  return (
    <div id="page" className="bg-gray-50 min-h-screen">
      <Header />

      <main className="theia-exception">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 py-3 md:py-4 shadow-sm">
          <div className="container mx-auto px-3 sm:px-4">
            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto">
              <span className="text-gray-500 hover:text-green-600 cursor-pointer transition-colors whitespace-nowrap">{area}</span>
              <span className="text-gray-400">›</span>
              <span className="text-gray-500 hover:text-green-600 cursor-pointer transition-colors whitespace-nowrap">{name} in {area}</span>
              <span className="text-gray-400">›</span>
              <span className="text-gray-500 hover:text-green-600 cursor-pointer transition-colors whitespace-nowrap">{location}</span>
              <span className="text-gray-400">›</span>
              <span className="text-green-600 font-semibold whitespace-nowrap">{filteredListings.length}+ Listings</span>
            </nav>
          </div>
        </div>

        {/* Page Header with Search Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-3 sm:px-4">
            {/* Main Header Section */}
            <div className="py-6 md:py-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <span className="text-2xl md:text-4xl">{categoryIcon}</span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                      {pageTitle}
                    </h1>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-3 md:mb-0">{categoryDescription}</p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3 md:gap-6 mt-3 md:mt-4">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs md:text-sm text-gray-600">{filteredListings.filter(l => l.isOpen).length} Open Now</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs md:text-sm text-gray-600">{filteredListings.filter(l => l.rating >= 4.5).length} Highly Rated</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs md:text-sm text-gray-600">{filteredListings.length} {name} in {location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar Section */}
            <div className="pb-6 md:pb-8 border-t border-gray-100 pt-6 md:pt-8 mx-2.5">
              <div className="w-full">
                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Find the Perfect {name}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Search by business name, services, location, or description
                  </p>
                </div>
                
                <div className="relative w-full">
                  <div className="relative flex items-center w-full">
                    <svg className="absolute left-4 h-5 w-5 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    
                    <input
                      type="text"
                      placeholder={`Search ${name} in ${location}...`}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-3 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-lg text-gray-900 placeholder-gray-500 text-base"
                    />
                    
                    {searchQuery && (
                      <button
                        onClick={() => handleSearch('')}
                        className="absolute right-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
                      >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results Info */}
                  {searchQuery && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 bg-white inline-block px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <span className="font-semibold text-green-600">{filteredListings.length}</span> results found for 
                        <span className="font-medium text-gray-900"> "{searchQuery}"</span>
                      </p>
                      <button
                        onClick={() => handleSearch('')}
                        className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Container */}
        <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
          <ListingsContainer 
            initialListings={filteredListings}
            categoryName={name}
            location={location}
            fallbackImage={fallbackImage}
            onOpenReviewModal={openReviewModal}
          />
        </div>
      </main>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        onSubmit={handleSubmitReview}
        businessName={selectedBusiness?.displayName}
        businessImages={selectedBusiness?.images || []}
        onLoginRequest={handleLoginRequest}
      />

      <Footer />
    </div>
  );
}

// Clean image extraction
function getListingImagesFromAPI(listing: any): string[] {
  if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
    const validImagePaths = listing.images
      .filter((img: any) => img && img.path && typeof img.path === 'string' && img.path.trim() !== '')
      .map((img: any) => getImageUrl(img.path));
    
    if (validImagePaths.length > 0) {
      return validImagePaths;
    }
  }

  if (listing.imageUrl && listing.imageUrl.trim() !== '') {
    return [listing.imageUrl];
  }

  return ["/default-listing.jpg"];
}

// Clean URL construction
function getImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return "/default-listing.jpg";
  }
  
  if (imagePath.startsWith('post_images/')) {
    return `https://allupipay.in/publicsewa/images/${imagePath}`;
  } else if (imagePath.startsWith('https://')) {
    return imagePath;
  } else {
    return `https://allupipay.in/publicsewa/images/${imagePath.replace(/^[\\/]+/, "")}`;
  }
}

// Helper functions
async function fetchAndFormatCategories(): Promise<{ fullPath: string; name: string }[]> {
  try {
    const res = await fetch("https://allupipay.in/publicsewa/api/main-search.php", {
      cache: "no-store",
    });

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

function getLocationInfo(slugArray: string[]) {
  const locationSlug = slugArray[0] || "kisanpur";
  const areaSlug = slugArray[1] || "lakhisarai";
  
  const location = locationSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
    
  const area = areaSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return { location, area };
}

function getCategoryDescription(categoryName: string, location: string, area: string) {
  const descriptions: { [key: string]: string } = {
    "beauty parlours": `Discover the best beauty services and salons near you in ${location}, ${area}. Find top-rated beauty parlours for all your beauty needs.`,
    "doctors": `Find the best doctors and medical specialists in ${location}, ${area}. Book appointments with top-rated healthcare professionals.`,
    "hospitals": `Discover leading hospitals and healthcare centers in ${location}, ${area}. Find emergency care, specialists, and medical facilities.`,
    "restaurants": `Explore the finest restaurants and eateries in ${location}, ${area}. Discover delicious cuisine and dining experiences.`,
    "hotels": `Find the perfect hotels and accommodations in ${location}, ${area}. Book your stay with top-rated hospitality services.`,
    "electricians": `Hire reliable electricians and electrical services in ${location}, ${area}. Find experts for all your electrical needs.`,
    "plumbers": `Find professional plumbers and plumbing services in ${location}, ${area}. Get quick solutions for all plumbing issues.`,
    "carpenters": `Discover skilled carpenters and woodwork services in ${location}, ${area}. Quality craftsmanship for your projects.`,
    "teachers": `Find qualified teachers and tutors in ${location}, ${area}. Get personalized learning and educational support.`,
    "drivers": `Hire professional drivers and chauffeur services in ${location}, ${area}. Safe and reliable transportation solutions.`
  };

  const lowerCategory = categoryName.toLowerCase();
  return descriptions[lowerCategory] || `Discover the best ${categoryName.toLowerCase()} services in ${location}, ${area}. Find top-rated professionals and service providers near you.`;
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

    if (lastPart.startsWith("child")) {
      formData.append("childrenId", lastPart);
    } else if (lastPart.startsWith("sub")) {
      formData.append("subcategoryId", lastPart);
    } else if (lastPart.startsWith("cat")) {
      formData.append("category", lastPart);
    }

    const res = await fetch(
      "https://allupipay.in/publicsewa/api/users/main-search-display-request-for-web.php",
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    let listings: any[] = [];
    if (Array.isArray(data)) listings = data;
    else if (data?.data && Array.isArray(data.data)) listings = data.data;
    else
      listings = Object.values(data)
        .flat()
        .filter((v) => Array.isArray(v))
        .flat();

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
  
  if (categoryServices) {
    return categoryServices[index % categoryServices.length];
  }
  
  return defaultServices;
}