'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ListingCardProps {
  listing: any;
  fallbackImage: string;
  categoryName: string;
  onReviewClick?: () => void;
}

// Fixed Image Slider Component without Auto-Slide
function ImageSlider({ images, alt, fallbackImage }: { images: string[], alt: string, fallbackImage: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const displayImages = images && images.length > 0 ? images : [fallbackImage];

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isAnimating || displayImages.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isAnimating || displayImages.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnimating || index === currentIndex) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 rounded-lg">
      {/* Image Container */}
      <div className="relative w-full h-full">
        {displayImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-300 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 transform translate-x-0'
                : index < currentIndex
                ? 'opacity-0 transform -translate-x-full'
                : 'opacity-0 transform translate-x-full'
            }`}
          >
            <img
              src={image}
              alt={`${alt} - Image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackImage;
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if multiple images */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            disabled={isAnimating}
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            disabled={isAnimating}
          >
            ›
          </button>
        </>
      )}

      {/* Dot Indicators - Only show if multiple images */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              disabled={isAnimating}
            />
          ))}
        </div>
      )}

      {/* Image Counter - Only show if multiple images */}
      {displayImages.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}

      {/* No Image Fallback */}
      {displayImages.length === 0 && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500">
          <span className="text-2xl mb-2">📷</span>
          <span className="text-sm">No Image Available</span>
        </div>
      )}
    </div>
  );
}

// Helper to render stars
function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-xs ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}`}>
      ★
    </span>
  ));
}

// Helper to generate SEO-friendly slugs
const generateSlug = (text: string): string => {
  if (!text) return 'unknown';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function ListingCard({ listing, fallbackImage, categoryName, onReviewClick }: ListingCardProps) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  // ✅ ADDED: First, check if listing is undefined
  if (!listing) {
    console.error('ListingCard: listing prop is undefined');
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <p className="text-gray-500 text-center">Business information not available</p>
      </div>
    );
  }

  useEffect(() => {
    console.log('📋 LISTING DATA:', listing);
  }, [listing]);

  // Get current URL path on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      // Trigger entrance animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  // ✅ FIXED: Safe access to listing.images with fallback
  const listingImages = listing && listing.images && Array.isArray(listing.images) && listing.images.length > 0 
    ? listing.images 
    : [fallbackImage];

  // ✅ FIXED: URL generation logic with district/block/village
  const handleBusinessClick = () => {
    if (!listing || !listing.id) return;

    try {
      // Get location data from listing with safe fallbacks
      const district = listing.district || 'unknown-district';
      const block = listing.block || 'unknown-block';
      const village = listing.village || 'unknown-village';
      const businessName = listing.displayName || listing.businessName || 'business';
      
      // Generate slugs for location
      const districtSlug = generateSlug(district);
      const blockSlug = generateSlug(block);
      const villageSlug = generateSlug(village);
      const businessSlug = generateSlug(businessName);
      
      // Get current path segments to extract category structure
      const pathSegments = currentPath.split('/').filter(segment => segment);
      
      if (pathSegments.length >= 4) {
        // Extract category segments from current path
        // Skip first segment if it's "list"
        const startIndex = pathSegments[0] === 'list' ? 1 : 0;
        const categorySegments = pathSegments.slice(startIndex);
        
        // Build URL: /list/district/block/village/category-segments/business/id
        const dynamicUrl = `/list/${districtSlug}/${blockSlug}/${villageSlug}/${categorySegments.join('/')}/${businessSlug}/${listing.id}`;
        router.push(dynamicUrl);
        return;
      }

      // Fallback 1: If we have category slugs from listing data
      if (listing.mainCategorySlug && listing.subCategorySlug && listing.childCategorySlug) {
        const dynamicUrl = `/list/${districtSlug}/${blockSlug}/${villageSlug}/${listing.mainCategorySlug}/${listing.subCategorySlug}/${listing.childCategorySlug}/${businessSlug}/${listing.id}`;
        router.push(dynamicUrl);
        return;
      }

      // Fallback 2: Use categoryName as the category segment
      const categorySlug = generateSlug(categoryName);
      const fallbackUrl = `/list/${districtSlug}/${blockSlug}/${villageSlug}/${categorySlug}/${businessSlug}/${listing.id}`;
      router.push(fallbackUrl);

    } catch (error) {
      console.error('Error generating business URL:', error);
      // Ultimate fallback
      const businessSlug = generateSlug(listing.displayName || listing.businessName || 'business');
      const ultimateFallbackUrl = `/list/business/${businessSlug}/${listing.id || '0'}`;
      router.push(ultimateFallbackUrl);
    }
  };

  // Event handlers
  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing && listing.phone) window.open(`tel:${listing.phone}`);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing && listing.phone) {
      const message = `Hi, I'm interested in your ${categoryName} services. Could you please provide more information?`;
      const whatsappUrl = `https://wa.me/${listing.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEnquiryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Enquiry form for ${listing?.displayName || 'Business'} will open here`);
  };

  const handleDirectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing && listing.latitude && listing.longitude) {
      window.open(`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`, '_blank');
    } else if (listing && listing.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`, '_blank');
    } else {
      alert('Location information not available');
    }
  };

  // ✅ ADDED: Review button handler
  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReviewClick) {
      onReviewClick();
    }
  };

  // ✅ FIXED: Safe access to all listing properties
  const displayName = listing?.displayName || listing?.businessName || 'Business Name';
  const location = listing?.location || `${listing?.village || ''}, ${listing?.block || ''}, ${listing?.district || ''}`.replace(/, ,/g, '').trim() || 'Location not specified';
  const rating = listing?.rating || 0;
  const reviewCount = listing?.reviewCount || 0;
  const badge = listing?.badge || 'Featured';
  const badgeColor = listing?.badgeColor || 'bg-blue-500';
  const distance = listing?.distance || '0';
  const isOpen = listing?.isOpen !== undefined ? listing.isOpen : true;
  const description = listing?.description || "Welcome to our service provider. We offer a comprehensive range of services to meet your needs...";
  const services = listing?.services || [];
  const phone = listing?.phone;
  const respondsIn = listing?.respondsIn;

  return (
    <div 
      className={`
        group bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 overflow-hidden 
        transition-all duration-500 cursor-pointer
        transform 
        ${isVisible 
          ? 'opacity-100 translate-y-0 hover:-translate-y-2' 
          : 'opacity-0 translate-y-8'
        }
      `}
      onClick={handleBusinessClick}
    >
      <div className="flex flex-col lg:flex-row h-full">
        {/* Image Section with Fixed Slider */}
        <div className="lg:w-56 lg:flex-shrink-0 h-40 lg:h-44 relative">
          <ImageSlider 
            images={listingImages}
            alt={displayName}
            fallbackImage={fallbackImage}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 sm:p-4">
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`${badgeColor} text-white text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all duration-300 group-hover:scale-105`}>
                    {badge}
                  </span>
                  <span className="text-[10px] text-gray-600 bg-white/80 px-1.5 py-0.5 rounded-full border border-gray-200 transition-all duration-300 group-hover:bg-blue-50">
                    📍 {distance} km
                  </span>
                  {isOpen ? (
                    <span className="text-[10px] text-[#058A07] bg-[#058A07]/10 px-1.5 py-0.5 rounded-full border border-[#058A07]/20 font-medium animate-pulse">
                      🟢 Open Now
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200 font-medium">
                      🔴 Closed
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-[#058A07] transition-all duration-500 transform group-hover:translate-x-1">
                  {displayName}
                </h3>
                
                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600 mb-2 transition-colors duration-300 group-hover:text-gray-800">
                  <span className="text-sm">🏢</span>
                  <span className="text-xs">{location}</span>
                </div>
              </div>
              
              {/* Rating Section */}
              <div className="text-right bg-white rounded px-2 py-1.5 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                <div className="flex items-center gap-1 mb-0.5 justify-end">
                  {renderStars(rating)}
                  <span className="text-sm font-bold text-gray-900">
                    {rating}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  {reviewCount.toLocaleString()} reviews
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-3 flex-1">
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
                {description}
              </p>
            </div>

            {/* Services Tags */}
            <div className="mb-3">
              <h4 className="text-[10px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide transition-colors duration-300 group-hover:text-gray-900">
                SERVICES OFFERED
              </h4>
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 3).map((service: string, serviceIndex: number) => (
                  <span 
                    key={serviceIndex} 
                    className="inline-flex items-center px-1.5 py-0.5 bg-[#0076D7]/10 text-[#0076D7] rounded text-[10px] border border-[#0076D7]/20 font-medium transition-all duration-300 hover:bg-[#0076D7] hover:text-white hover:scale-105 hover:shadow-md"
                  >
                    {service}
                  </span>
                ))}
                {services.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] border border-gray-200 font-medium transition-all duration-300 hover:bg-gray-200 hover:scale-105">
                    +{services.length - 3} more
                  </span>
                )}
                {services.length === 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] border border-gray-200 font-medium">
                    Services not listed
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons - ✅ INCLUDES REVIEW BUTTON */}
            <div className="mt-auto">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5 mb-2">
                {/* Call Button */}
                {phone ? (
                  <button 
                    onClick={handleCallClick}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#058A07] text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 text-[10px]"
                  >
                    <span className="text-xs">📞</span>
                    <span>Call Now</span>
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow text-[10px]">
                    <span className="text-xs">📞</span>
                    <span>Show Number</span>
                  </button>
                )}
                
                {/* WhatsApp Button */}
                {phone ? (
                  <button 
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#058A07] text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 text-[10px]"
                  >
                    <span className="text-xs">💬</span>
                    <span>WhatsApp</span>
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-500 rounded-lg font-semibold cursor-not-allowed text-[10px]">
                    <span className="text-xs">💬</span>
                    <span>WhatsApp</span>
                  </button>
                )}
                
                {/* ✅ REVIEW BUTTON */}
                <button 
                  onClick={handleReviewClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 text-[10px]"
                >
                  <span className="text-xs">⭐</span>
                  <span>Review</span>
                </button>
                
                {/* Direction Button */}
                <button 
                  onClick={handleDirectionClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#FF6B00] text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 hover:bg-[#E55A00] text-[10px]"
                >
                  <span className="text-xs">📍</span>
                  <span>Direction</span>
                </button>
                
                {/* Enquiry Button */}
                <button 
                  onClick={handleEnquiryClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-[#0076D7] text-[#0076D7] rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow hover:bg-[#0076D7] hover:text-white hover:scale-105 text-[10px]"
                >
                  <span className="text-xs">📩</span>
                  <span>Enquiry</span>
                </button>
              </div>

              {/* Response Time */}
              {respondsIn && (
                <div className="flex items-center gap-1 text-[10px] text-[#058A07] font-semibold bg-[#058A07]/10 px-2 py-1 rounded border border-[#058A07]/20 transition-all duration-300 hover:bg-[#058A07]/20 hover:shadow-sm">
                  <span className="text-[10px]">⚡</span>
                  <span>Responds within {respondsIn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}