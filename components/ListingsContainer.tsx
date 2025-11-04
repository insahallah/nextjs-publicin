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
}

export default function ListingsContainer({ 
  initialListings, 
  categoryName, 
  location, 
  fallbackImage 
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

    console.log('Applying filters:', filters);
    console.log('Applying sort:', sortBy);
    console.log('Initial listings:', initialListings.map(l => ({ name: l.displayName, rating: l.rating })));

    // Apply filters
    if (filters.openNow) {
      filteredListings = filteredListings.filter(listing => listing.isOpen);
      console.log('After open now filter:', filteredListings.length);
    }

    if (filters.topRated) {
      filteredListings = filteredListings.filter(listing => listing.rating >= 4.5);
      console.log('After top rated filter:', filteredListings.length);
    }

    // Apply sorting
    let sortedListings = [...filteredListings];
    
    switch (sortBy) {
      case 'rating-high-low':
        sortedListings.sort((a, b) => b.rating - a.rating);
        console.log('Sorted by rating high to low:', sortedListings.map(l => l.rating));
        break;
      case 'rating-low-high':
        sortedListings.sort((a, b) => a.rating - b.rating);
        console.log('Sorted by rating low to high:', sortedListings.map(l => l.rating));
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
    console.log('Final listings:', sortedListings.map(l => ({ name: l.displayName, rating: l.rating })));
  }, [sortBy, filters, initialListings]);

  const handleSortChange = (newSortBy: string) => {
    console.log('Sort changed to:', newSortBy);
    setSortBy(newSortBy);
  };

  const handleFilterChange = (newFilters: { openNow: boolean; topRated: boolean }) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
  };

  return (
    <>
      {/* Sorting Controls - Now inside the same component */}
      <div className="flex justify-end mb-6">
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

      <div className="grid gap-6 lg:gap-8">
        {listings.map((listing, index) => (
          <ListingCard 
            key={listing.id || index}
            listing={listing}
            fallbackImage={fallbackImage}
            categoryName={categoryName}
          />
        ))}

        {/* Dynamic No Listings Fallback */}
        {listings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="text-8xl mb-6">{getCategoryIcon(categoryName)}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No {categoryName} Found in {location}
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              We couldn't find any active {categoryName.toLowerCase()} listings in {location}.
            </p>
            <button className="px-8 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md">
              Search Nearby Areas
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Load More */}
      {listings.length > 0 && (
        <div className="text-center mt-12">
          <button className="px-12 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md">
            Load More {categoryName} in {location} ({listings.length}+)
          </button>
        </div>
      )}
    </>
  );
}