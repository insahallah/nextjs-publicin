'use client';

import ListingCard from './ListingCard';
import BusinessFilter from './FilterBar'; // ✅ Correct import
import { useState, useMemo } from 'react'; // ✅ useMemo add karo

interface ListingsContainerProps {
  initialListings: any[];
  categoryName: string;
  location: string;
  fallbackImage: string;
  onOpenReviewModal?: (business: any) => void;
}

export default function ListingsContainer({
  initialListings,
  categoryName,
  location,
  fallbackImage,
  onOpenReviewModal
}: ListingsContainerProps) {
  const [filters, setFilters] = useState({
    rating: 0,
    village: '',
    block: '',
    district: '',
    city: '',
    sortBy: 'relevance',
    hasReviews: false,
    isOpenNow: false,
    searchQuery: ''
  });

  // ✅ Filtered listings with useMemo for performance
  const filteredListings = useMemo(() => {
    let results = [...initialListings];

    // ✅ Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(listing => 
        listing.village?.toLowerCase().includes(query) ||
        listing.block?.toLowerCase().includes(query) ||
        listing.district?.toLowerCase().includes(query) ||
        listing.city?.toLowerCase().includes(query) ||
        listing.businessName?.toLowerCase().includes(query) ||
        listing.displayName?.toLowerCase().includes(query)
      );
    }

    // ✅ Village filter
    if (filters.village) {
      results = results.filter(listing => listing.village === filters.village);
    }

    // ✅ Block filter
    if (filters.block) {
      results = results.filter(listing => listing.block === filters.block);
    }

    // ✅ District filter
    if (filters.district) {
      results = results.filter(listing => listing.district === filters.district);
    }

    // ✅ City filter
    if (filters.city) {
      results = results.filter(listing => listing.city === filters.city);
    }

    // ✅ Rating filter
    if (filters.rating > 0) {
      results = results.filter(listing => listing.rating >= filters.rating);
    }

    // ✅ Sort filter
    if (filters.sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'reviews') {
      results.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (filters.sortBy === 'distance') {
      results.sort((a, b) => parseFloat(a.distance || '999') - parseFloat(b.distance || '999'));
    }

    return results;
  }, [initialListings, filters]);

  const handleOpenReviewModal = (business: any) => {
    if (onOpenReviewModal) {
      onOpenReviewModal(business);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* ✅ Filter Bar with listings data */}
      <BusinessFilter 
        onFilterChange={handleFilterChange}
        listings={initialListings} // ✅ Listings data pass karo
      />
      
      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredListings.map((listing, index) => (
          <ListingCard
            key={listing.id || index}
            listing={listing}
            fallbackImage={fallbackImage}
            categoryName={categoryName}
            onReviewClick={() => handleOpenReviewModal(listing)}
          />
        ))}
      </div>

      {/* No Results Message */}
      {filteredListings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No businesses found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      )}
    </div>
  );
}