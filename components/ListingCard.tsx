'use client';

import ImageSlider from './ImageSlider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ListingCardProps {
  listing: any;
  fallbackImage: string;
  categoryName: string;
  onReviewClick?: () => void;
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

  // Get current URL path on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const listingImages = listing.images && Array.isArray(listing.images) && listing.images.length > 0 
    ? listing.images 
    : [fallbackImage];

  // ✅ FIXED: Get the correct business name
  const getBusinessDisplayName = () => {
    // Priority order for business name
    return listing.businessName || 
           listing.displayName || 
           listing.name || 
           "Business";
  };

  // ✅ UPDATED: Prepare business data for URL parameters
  const prepareBusinessData = () => {
    return {
      id: listing.id,
      businessName: listing.businessName,
      displayName: getBusinessDisplayName(),
      description: listing.description,
      phone: listing.phone,
      location: listing.location,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      services: listing.services,
      images: listing.images,
      isOpen: listing.isOpen,
      latitude: listing.latitude,
      longitude: listing.longitude,
      category: categoryName
    };
  };

  // ✅ UPDATED: Correct URL generation with business data in parameters
  const handleBusinessClick = () => {
    const businessDisplayName = getBusinessDisplayName();
    const businessId = listing.id;

    if (!businessId || !businessDisplayName) {
      console.error('❌ Missing business ID or name:', { businessId, businessDisplayName });
      return;
    }

    try {
      // Get the current full path
      const pathSegments = currentPath.split('/').filter(segment => segment);
      
      console.log('🔗 Current path segments:', pathSegments);
      console.log('🏢 Business details:', {
        id: businessId,
        displayName: businessDisplayName,
        businessName: listing.businessName,
        originalDisplayName: listing.displayName
      });
      
      if (pathSegments.length < 2) {
        // If no proper category path, use simple fallback
        const businessSlug = generateSlug(businessDisplayName);
        const businessData = prepareBusinessData();
        const encodedData = encodeURIComponent(JSON.stringify(businessData));
        const fallbackUrl = `/list/${generateSlug(categoryName)}/${businessSlug}/${businessId}?data=${encodedData}`;
        console.log('🔗 Using fallback URL:', fallbackUrl);
        router.push(fallbackUrl);
        return;
      }

      // Remove the "list" prefix to get category segments
      const categorySegments = pathSegments.slice(1); // Remove "list"
      
      console.log('📁 Original category segments:', categorySegments);
      
      // ✅ FIXED: Keep ALL segments including IDs
      const cleanCategorySegments = [...categorySegments];
      
      // ✅ FIXED: Generate business slug from correct business name
      const businessSlug = generateSlug(businessDisplayName);
      
      // ✅ ADDED: Prepare and encode business data for URL parameters
      const businessData = prepareBusinessData();
      const encodedData = encodeURIComponent(JSON.stringify(businessData));
      
      // Construct URL with full category path + business + data parameters
      const dynamicUrl = `/list/${cleanCategorySegments.join('/')}/${businessSlug}/${businessId}?data=${encodedData}`;
      
      console.log('🔗 Final URL components:', {
        categoryPath: cleanCategorySegments.join('/'),
        businessSlug,
        businessId,
        encodedDataLength: encodedData.length,
        finalUrl: dynamicUrl
      });
      
      console.log('🔗 Navigating to:', dynamicUrl);
      router.push(dynamicUrl);
      
    } catch (error) {
      console.error('Error generating business URL:', error);
      // Ultimate fallback
      const businessSlug = generateSlug(getBusinessDisplayName());
      const businessData = prepareBusinessData();
      const encodedData = encodeURIComponent(JSON.stringify(businessData));
      const fallbackUrl = `/list/${generateSlug(categoryName)}/${businessSlug}/${listing.id}?data=${encodedData}`;
      console.log('🔗 Using ultimate fallback URL:', fallbackUrl);
      router.push(fallbackUrl);
    }
  };

  // Event handlers with proper type definitions
  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.phone) {
      window.open(`tel:${listing.phone}`);
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.phone) {
      const message = `Hi, I'm interested in your ${categoryName} services. Could you please provide more information?`;
      const whatsappUrl = `https://wa.me/${listing.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEnquiryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Enquiry form for ${getBusinessDisplayName()} will open here`);
  };

  // ✅ UPDATED: Review click handler with business data
  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prepare business data for review modal
    const businessData = {
      id: listing.id,
      businessName: listing.businessName,
      displayName: getBusinessDisplayName(),
      description: listing.description,
      phone: listing.phone,
      location: listing.location,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      services: listing.services,
      images: listing.images,
      isOpen: listing.isOpen,
      category: categoryName
    };

    console.log('📝 Review button clicked for business:', businessData);
    
    if (onReviewClick) {
      // Pass the business data to the parent component
      onReviewClick(businessData);
    } else {
      // Fallback: Open review modal directly or show alert
      alert(`Write review for ${getBusinessDisplayName()}`);
    }
  };

  const handleDirectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.latitude && listing.longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (listing.location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`;
      window.open(mapsUrl, '_blank');
    } else {
      alert('Location information not available');
    }
  };

  // ✅ FIXED: Use correct business name everywhere
  const businessDisplayName = getBusinessDisplayName();

  return (
    <div 
      className="group bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      onClick={handleBusinessClick}
    >
      <div className="flex flex-col lg:flex-row h-full">
        {/* Image Section */}
        <div className="lg:w-56 lg:flex-shrink-0 h-40 lg:h-44 relative">
          <ImageSlider 
            images={listingImages} 
            alt={businessDisplayName} 
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
                  <span className={`${listing.badgeColor} text-[10px] px-2 py-0.5 rounded-full font-semibold`}>
                    {listing.badge}
                  </span>
                  <span className="text-[10px] text-gray-600 bg-white/80 px-1.5 py-0.5 rounded-full border border-gray-200">
                    📍 {listing.distance} km
                  </span>
                  {listing.isOpen ? (
                    <span className="text-[10px] text-[#058A07] bg-[#058A07]/10 px-1.5 py-0.5 rounded-full border border-[#058A07]/20 font-medium">
                      🟢 Open Now
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200 font-medium">
                      🔴 Closed
                    </span>
                  )}
                </div>
                
                {/* ✅ FIXED: Use correct business name */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-[#058A07] transition-colors duration-300">
                  {businessDisplayName}
                </h3>
                
                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600 mb-2">
                  <span className="text-sm">🏢</span>
                  <span className="text-xs">{listing.location}</span>
                  {listing.latitude && listing.longitude && (
                    <span className="text-[8px] text-gray-400 ml-1">
                      ({parseFloat(listing.latitude).toFixed(4)}, {parseFloat(listing.longitude).toFixed(4)})
                    </span>
                  )}
                </div>
              </div>
              
              {/* Rating Section */}
              <div className="text-right bg-white rounded px-2 py-1.5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-0.5 justify-end">
                  {renderStars(listing.rating)}
                  <span className="text-sm font-bold text-gray-900">
                    {listing.rating}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  {listing.reviewCount?.toLocaleString() || 0} reviews
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-3 flex-1">
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {listing.description || `Welcome to ${businessDisplayName}. We provide quality ${categoryName} services with professional expertise and customer satisfaction.`}
              </p>
            </div>

            {/* Services Tags */}
            <div className="mb-3">
              <h4 className="text-[10px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">SERVICES OFFERED</h4>
              <div className="flex flex-wrap gap-1">
                {listing.services?.slice(0, 3).map((service: string, serviceIndex: number) => (
                  <span 
                    key={serviceIndex} 
                    className="inline-flex items-center px-1.5 py-0.5 bg-[#0076D7]/10 text-[#0076D7] rounded text-[10px] border border-[#0076D7]/20 font-medium"
                  >
                    {service}
                  </span>
                ))}
                {listing.services?.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] border border-gray-200 font-medium">
                    +{listing.services.length - 3} more
                  </span>
                )}
                {(!listing.services || listing.services.length === 0) && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] border border-gray-200 font-medium">
                    Professional Services
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5 mb-2">
                {/* Call Button */}
                {listing.phone ? (
                  <button 
                    onClick={handleCallClick}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#058A07] text-white rounded-lg font-semibold hover:bg-[#047506] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
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
                {listing.phone ? (
                  <button 
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#058A07] text-white rounded-lg font-semibold hover:bg-[#047506] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
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
                
                {/* Direction Button */}
                <button 
                  onClick={handleDirectionClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#FF6B00] text-white rounded-lg font-semibold hover:bg-[#E55A00] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
                  title={listing.latitude && listing.longitude ? 
                    `Exact location: ${listing.latitude}, ${listing.longitude}` : 
                    'Get directions'}
                >
                  <span className="text-xs">📍</span>
                  <span className="text-[10px]">Direction</span>
                </button>
                
                {/* Enquiry Button */}
                <button 
                  onClick={handleEnquiryClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-[#0076D7] text-[#0076D7] rounded-lg font-semibold hover:bg-[#0076D7]/5 transition-all duration-200 shadow-sm hover:shadow text-[10px]"
                >
                  <span className="text-xs">📩</span>
                  <span>Send Enquiry</span>
                </button>

                {/* ✅ UPDATED: Review Button with proper business data */}
                <button 
                  onClick={handleReviewClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#0076D7] text-white rounded-lg font-semibold hover:bg-[#0066C4] transition-all duration-200 shadow-sm hover:shadow text-[10px]"
                  title={`Write review for ${businessDisplayName}`}
                >
                  <span className="text-xs">⭐</span>
                  <span>Write Review</span>
                </button>
              </div>

              {/* Response Time */}
              {listing.respondsIn && (
                <div className="flex items-center gap-1 text-[10px] text-[#058A07] font-semibold bg-[#058A07]/10 px-2 py-1 rounded border border-[#058A07]/20">
                  <span className="text-[10px]">⚡</span>
                  <span>Responds within {listing.respondsIn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
