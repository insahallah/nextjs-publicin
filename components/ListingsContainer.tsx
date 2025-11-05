'use client';

import { useState, useEffect } from 'react';
import ListingCard from './ListingCard';
import SortingControls from './SortingControls';
import { getCategoryIcon } from '@/utils/categoryUtils';

interface ListingsContainerProps {
  initialListings: any[];
  categoryName: string;
  location: string;
  fallbackImage: string;
  onOpenReviewModal?: (business: any) => void; // ✅ Prop add kiya
}

export default function ListingsContainer({ 
  initialListings, 
  categoryName, 
  location, 
  fallbackImage,
  onOpenReviewModal // ✅ Prop receive karo
}: ListingsContainerProps) {
  const [listings, setListings] = useState(initialListings);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    openNow: false,
    topRated: false
  });

  // Apply sorting and filtering
  useEffect(() => {
    let filteredListings = [...initialListings];

    // Apply filters
    if (filters.openNow) {
      filteredListings = filteredListings.filter(listing => listing.isOpen);
    }

    if (filters.topRated) {
      filteredListings = filteredListings.filter(listing => listing.rating >= 4.5);
    }

    // Apply sorting
    let sortedListings = [...filteredListings];
    
    switch (sortBy) {
      case 'rating-high-low':
        sortedListings.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low-high':
        sortedListings.sort((a, b) => a.rating - b.rating);
        break;
      case 'distance-near-far':
        sortedListings.sort((a, b) => a.distance - b.distance);
        break;
      case 'distance-far-near':
        sortedListings.sort((a, b) => b.distance - a.distance);
        break;
      case 'popularity':
        sortedListings.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // relevance - keep original order
        break;
    }

    setListings(sortedListings);
  }, [sortBy, filters, initialListings]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleFilterChange = (newFilters: { openNow: boolean; topRated: boolean }) => {
    setFilters(newFilters);
  };

  return (
    <>
      {/* Header with Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-xl">
            <span className="text-white text-sm font-semibold">
              {listings.length} {listings.length === 1 ? 'Result' : 'Results'}
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
          <p className="text-gray-600 text-sm hidden sm:block">
            Showing {categoryName.toLowerCase()} in {location}
          </p>
        </div>
        
        <SortingControls 
          totalListings={listings.length}
          categoryName={categoryName}
          location={location}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          currentSort={sortBy}
          currentFilters={filters}
        />
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8">
        {listings.map((listing, index) => (
          <ListingCard 
            key={listing.id || index}
            listing={listing}
            fallbackImage={fallbackImage}
            categoryName={categoryName}
            onReviewClick={() => onOpenReviewModal?.(listing)} // ✅ Yahaan pass karo
          />
        ))}

        {/* No Results State */}
        {listings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl md:text-7xl mb-4">{getCategoryIcon(categoryName)}</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                No {categoryName} Found
              </h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                We couldn't find any {categoryName.toLowerCase()} matching your criteria in {location}. Try adjusting your filters or search in nearby areas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Search Nearby Areas
                </button>
                <button 
                  onClick={() => {
                    setFilters({ openNow: false, topRated: false });
                    setSortBy('relevance');
                  }}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Load More */}
      {listings.length > 0 && (
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300 shadow-2xl hover:shadow-3xl">
            Load More {categoryName} ({listings.length}+)
          </button>
        </div>
      )}
    </>
  );
}