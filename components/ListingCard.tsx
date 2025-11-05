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
    <span key={i} className={`text-sm ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}`}>
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
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden transition-all duration-500 hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Image Section */}
        <div className="lg:w-80 lg:flex-shrink-0 h-64 lg:h-80 relative">
          <ImageSlider 
            images={listingImages}
            alt={listing.displayName}
            fallbackImage={fallbackImage}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`${listing.badgeColor} text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg`}>
                    {listing.badge}
                  </span>
                  <span className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded-full border border-gray-200">
                    📍 {listing.distance} km
                  </span>
                  {listing.isOpen ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 font-medium">
                      🟢 Open Now
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200 font-medium">
                      🔴 Closed
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                  {listing.displayName}
                </h3>
                
                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <span className="text-lg">🏢</span>
                  <span className="text-sm sm:text-base">{listing.location}</span>
                </div>
              </div>
              
              {/* Rating Section */}
              <div className="text-right bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  {renderStars(listing.rating)}
                  <span className="text-lg font-bold text-gray-900">
                    {listing.rating}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{listing.reviewCount?.toLocaleString() || 0} reviews</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 line-clamp-3">
                {listing.description || "No description available."}
              </p>
            </div>

            {/* Services Tags */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Services Offered</h4>
              <div className="flex flex-wrap gap-2">
                {listing.services?.slice(0, 4).map((service: string, serviceIndex: number) => (
                  <span 
                    key={serviceIndex} 
                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200 font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {service}
                  </span>
                ))}
                {listing.services?.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-200 font-medium">
                    +{listing.services.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {/* Call Button */}
                {listing.phone ? (
                  <button 
                    onClick={handleCallClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-lg">📞</span>
                    <span className="text-xs">Call Now</span>
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span className="text-lg">📞</span>
                    <span className="text-xs">Show Number</span>
                  </button>
                )}
                
                {/* WhatsApp Button */}
                {listing.phone ? (
                  <button 
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-xl font-semibold hover:bg-green-200 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-xs">WhatsApp</span>
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed">
                    <span className="text-lg">💬</span>
                    <span className="text-xs">WhatsApp</span>
                  </button>
                )}
                
                {/* Enquiry Button */}
                <button 
                  onClick={handleEnquiryClick}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="text-lg">📩</span>
                  <span className="text-xs">Send Enquiry</span>
                </button>

                {/* Review Button */}
                <button 
                  onClick={handleReviewClick}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="text-lg">⭐</span>
                  <span className="text-xs">Write Review</span>
                </button>
              </div>

              {/* Response Time */}
              {listing.respondsIn && (
                <div className="flex items-center gap-2 text-xs text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <span className="text-sm">⚡</span>
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