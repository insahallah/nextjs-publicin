'use client';

import ImageSlider from './ImageSlider';

interface ListingCardProps {
  listing: any;
  fallbackImage: string;
  categoryName: string;
  onReviewClick?: () => void;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-xs ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}`}>
      ★
    </span>
  ));
}

export default function ListingCard({ listing, fallbackImage, categoryName, onReviewClick }: ListingCardProps) {
  // ✅ Clean image handling without console logs
  const listingImages = listing.images && Array.isArray(listing.images) && listing.images.length > 0 
    ? listing.images 
    : [fallbackImage];

  const handleCallClick = () => {
    if (listing.phone) {
      window.open(`tel:${listing.phone}`);
    }
  };

  const handleWhatsAppClick = () => {
    if (listing.phone) {
      const message = `Hi, I'm interested in your ${categoryName} services. Could you please provide more information?`;
      const whatsappUrl = `https://wa.me/${listing.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEnquiryClick = () => {
    alert(`Enquiry form for ${listing.displayName} will open here`);
  };

  const handleReviewClick = () => {
    if (onReviewClick) {
      onReviewClick();
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Image Section - Compact Size */}
        <div className="lg:w-56 lg:flex-shrink-0 h-40 lg:h-44 relative">
          <ImageSlider 
            images={listingImages}
            alt={listing.displayName}
            fallbackImage={fallbackImage}
          />
        </div>

        {/* Content Section - Compact Padding */}
        <div className="flex-1 p-3 sm:p-4">
          <div className="flex flex-col h-full">
            {/* Header Section - Compact */}
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
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-[#058A07] transition-colors duration-300">
                  {listing.displayName}
                </h3>
                
                {/* Location - Compact */}
                <div className="flex items-center gap-1 text-gray-600 mb-2">
                  <span className="text-sm">🏢</span>
                  <span className="text-xs">{listing.location}</span>
                </div>
              </div>
              
              {/* Rating Section - Compact */}
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

            {/* Description - Compact with limited lines */}
            <div className="mb-3 flex-1">
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {listing.description || "Welcome to our service provider. While our name might echo a legacy of trust, our primary focus is entirely on delivering quality services. We offer a comprehensive range of services to meet your needs..."}
              </p>
            </div>

            {/* Services Tags - Compact */}
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
              </div>
            </div>

            {/* Action Buttons - Compact with Shake Animation */}
            <div className="mt-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
                {/* Call Button with Shake Animation - SOLID GREEN */}
                {listing.phone ? (
                  <button 
                    onClick={handleCallClick}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#058A07] text-white rounded-lg font-semibold hover:bg-[#047506] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 animate-pulse"
                  >
                    <span className="text-xs animate-bounce">📞</span>
                    <span>Call Now</span>
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow text-[10px]">
                    <span className="text-xs">📞</span>
                    <span>Show Number</span>
                  </button>
                )}
                
                {/* WhatsApp Button with Shake Animation - SOLID GREEN */}
                {listing.phone ? (
                  <button 
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#058A07] text-white rounded-lg font-semibold hover:bg-[#047506] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 animate-pulse"
                  >
                    <span className="text-xs animate-bounce">💬</span>
                    <span>WhatsApp</span>
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-500 rounded-lg font-semibold cursor-not-allowed text-[10px]">
                    <span className="text-xs">💬</span>
                    <span>WhatsApp</span>
                  </button>
                )}
                
                {/* Enquiry Button */}
                <button 
                  onClick={handleEnquiryClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-[#0076D7] text-[#0076D7] rounded-lg font-semibold hover:bg-[#0076D7]/5 transition-all duration-200 shadow-sm hover:shadow text-[10px]"
                >
                  <span className="text-xs">📩</span>
                  <span>Send Enquiry</span>
                </button>

                {/* Review Button */}
                <button 
                  onClick={handleReviewClick}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#0076D7] text-white rounded-lg font-semibold hover:bg-[#0066C4] transition-all duration-200 shadow-sm hover:shadow text-[10px]"
                >
                  <span className="text-xs">⭐</span>
                  <span>Write Review</span>
                </button>
              </div>

              {/* Response Time - Compact */}
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

      {/* Custom CSS for Shake Animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}