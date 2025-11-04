'use client';

import ImageSlider from './ImageSlider';

interface ListingCardProps {
  listing: any;
  fallbackImage: string;
  categoryName: string;
}

// ⭐ Rating stars component
function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-lg ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}`}>
      ★
    </span>
  ));
}

export default function ListingCard({ listing, fallbackImage, categoryName }: ListingCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Image Slider Section - Fixed Size */}
        <div className="lg:w-80 lg:flex-shrink-0 lg:h-80">
          <ImageSlider 
            images={listing.images} 
            alt={listing.displayName}
            fallbackImage={fallbackImage}
          />
        </div>

        {/* Content Section - Consistent Height */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`${listing.badgeColor} text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm`}>
                    {listing.badge}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {listing.distance} km away
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {listing.displayName}
                </h3>
                
                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <span className="text-lg">📍</span>
                  <span className="text-base">{listing.location}</span>
                </div>
              </div>
              
              {/* Rating Section */}
              <div className="text-right bg-gradient-to-br from-gray-50 to-white rounded-xl px-4 py-3 border border-gray-200/50 shadow-sm">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  {renderStars(listing.rating)}
                  <span className="text-xl font-bold text-gray-900">{listing.rating}</span>
                </div>
                <span className="text-sm text-gray-600">{listing.reviewCount.toLocaleString()} reviews</span>
              </div>
            </div>

            {/* Services Tags */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{categoryName} Services:</h4>
              <div className="flex flex-wrap gap-2">
                {listing.services.slice(0, 4).map((service: string, serviceIndex: number) => (
                  <span key={serviceIndex} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100 font-medium">
                    {service}
                  </span>
                ))}
                {listing.services.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm border border-gray-200 font-medium">
                    +{listing.services.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons - Pushed to bottom */}
            <div className="mt-auto">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {listing.phone ? (
                  <button className="flex items-center justify-center gap-3 px-6 py-3.5 bg-green-600 text-white rounded-xl text-base font-semibold hover:bg-green-700 transition-all duration-200 shadow-sm flex-1">
                    <span className="text-xl">📞</span>
                    <span>Call {listing.phone}</span>
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm flex-1">
                    <span className="text-xl">📞</span>
                    <span>Show Number</span>
                  </button>
                )}
                
                <button className="flex items-center justify-center gap-3 px-6 py-3.5 bg-green-100 text-green-800 rounded-xl text-base font-semibold hover:bg-green-200 transition-all duration-200 shadow-sm flex-1">
                  <span className="text-xl">💬</span>
                  <span>WhatsApp</span>
                </button>
                
                <button className="flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm flex-1">
                  <span className="text-xl">📩</span>
                  <span>Send Enquiry</span>
                </button>
              </div>

              {/* Response Time */}
              {listing.respondsIn && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-lg">⚡</span>
                  <span>Usually responds in {listing.respondsIn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}