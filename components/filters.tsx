'use client';

import { useState } from 'react';

interface FilterData {
  rating: number;
  location: string;
  sortBy: string;
  hasReviews: boolean;
  isOpenNow: boolean;
}

interface BusinessFilterProps {
  onFilterChange: (filters: FilterData) => void;
}

export default function BusinessFilter({ onFilterChange }: BusinessFilterProps) {
  const [filters, setFilters] = useState<FilterData>({
    rating: 0,
    location: '',
    sortBy: 'relevance',
    hasReviews: false,
    isOpenNow: false
  });

  // Sample data
  const locations = [
    'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur'
  ];

  const ratingOptions = [
    { value: 0, label: 'Any Rating' },
    { value: 3, label: '3+ Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 4.5, label: '4.5+ Stars' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'distance', label: 'Nearest' },
    { value: 'reviews', label: 'Most Reviews' },
  ];

  const updateFilter = (key: keyof FilterData, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = filters.rating > 0 || filters.location || filters.hasReviews || filters.isOpenNow || filters.sortBy !== 'relevance';

  return (
    <div className="w-full bg-white border-b border-gray-200">
      {/* Main Filter Bar - Always Visible */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filter By</h2>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  const resetFilters = {
                    rating: 0,
                    location: '',
                    sortBy: 'relevance',
                    hasReviews: false,
                    isOpenNow: false
                  };
                  setFilters(resetFilters);
                  onFilterChange(resetFilters);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                <span>🔄</span>
                Reset All
              </button>
            )}
          </div>

          {/* Rating Filter - Always Visible */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Rating</h3>
            <div className="flex flex-wrap gap-3">
              {ratingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('rating', option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    filters.rating === option.value
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter - Always Visible */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Location</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => updateFilter('location', '')}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  filters.location === ''
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="text-sm font-medium">All Locations</span>
                </div>
              </button>
              {locations.slice(0, 6).map((location) => (
                <button
                  key={location}
                  onClick={() => updateFilter('location', location)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    filters.location === location
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="text-sm font-medium">{location}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Filter - Always Visible */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Sort By</h3>
            <div className="flex flex-wrap gap-3">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('sortBy', option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    filters.sortBy === option.value
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* More Filters - Always Visible */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">More Options</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={filters.hasReviews}
                  onChange={(e) => updateFilter('hasReviews', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span className="text-sm font-medium">Has Reviews</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={filters.isOpenNow}
                  onChange={(e) => updateFilter('isOpenNow', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <span>🕒</span>
                  <span className="text-sm font-medium">Open Now</span>
                </div>
              </label>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.rating > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      ⭐ {filters.rating}+ Stars
                      <button 
                        onClick={() => updateFilter('rating', 0)} 
                        className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filters.location && (
                    <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      📍 {filters.location}
                      <button 
                        onClick={() => updateFilter('location', '')} 
                        className="w-4 h-4 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filters.hasReviews && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      💬 Has Reviews
                      <button 
                        onClick={() => updateFilter('hasReviews', false)} 
                        className="w-4 h-4 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filters.isOpenNow && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      🕒 Open Now
                      <button 
                        onClick={() => updateFilter('isOpenNow', false)} 
                        className="w-4 h-4 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Complete Page with Always Visible Filters
export function BusinessListingPage() {
  const [filters, setFilters] = useState({
    rating: 0,
    location: '',
    sortBy: 'relevance',
    hasReviews: false,
    isOpenNow: false
  });

  const businesses = [
    {
      id: 1,
      name: "TATA MOTORS Healthcare",
      rating: 4.5,
      reviews: 128,
      distance: "0.5 km",
      isOpen: true,
      responseTime: "Responds within 30 mins",
      specialties: ["General Medicine", "Preventative Care", "Routine Check-ups"],
      description: "Welcome to TATA MOTORS, your dedicated healthcare partner. While our name might echo a legacy of trust, health and well-being. We offer a comprehensive range of general medical services, from routine check-ups and preventative care."
    },
    {
      id: 2,
      name: "Child Health Paediatric Specialties",
      rating: 4.8,
      reviews: 256,
      distance: "1.2 km",
      isOpen: true,
      responseTime: "Responds within 45 mins",
      specialties: ["Neonatologists", "Child Specialists", "Pediatric Care"],
      description: "Specialized healthcare services for children and newborns with expert neonatologists and pediatric specialists."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900">Publicin</h1>
              <nav className="flex items-center gap-6 text-sm">
                <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Home</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Doctors</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Child Health</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Paediatric</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Neonatologists</a>
              </nav>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Search 🔍 | DKG | 21:36 | IV | 26-11-2025
            </div>
          </div>
        </div>
      </header>

      {/* Always Visible Filter Component */}
      <BusinessFilter onFilterChange={setFilters} />

      {/* Business Listings */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Healthcare Providers</h2>
          <p className="text-gray-600">{businesses.length} results found</p>
        </div>
        
        <div className="space-y-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left Section - Business Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{business.name}</h3>
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-lg">⭐</span>
                          <span className="text-gray-800 font-semibold">{business.rating}</span>
                          <span className="text-gray-500 text-sm">({business.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-lg">📍</span>
                          <span>{business.distance}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${business.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="text-lg">🕒</span>
                          <span className="font-medium">{business.isOpen ? 'Open Now' : 'Closed'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{business.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {business.specialties.map((specialty: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                        {specialty}
                      </span>
                    ))}
                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                      +1 more
                    </span>
                  </div>

                  <p className="text-green-600 font-semibold flex items-center gap-2">
                    <span>⚡</span>
                    {business.responseTime}
                  </p>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                    Call Now
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-green-50 text-green-700 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors border border-green-200 flex items-center justify-center gap-2">
                      <span>💬</span>
                      WhatsApp
                    </button>
                    <button className="bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200 flex items-center justify-center gap-2">
                      <span>⭐</span>
                      Review
                    </button>
                  </div>
                  <button className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors flex items-center gap-1 justify-center">
                    Get Directions
                    <span>↗</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}