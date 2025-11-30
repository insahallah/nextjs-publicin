'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface FilterData {
  rating: number;
  sortBy: string;
  hasReviews: boolean;
  isOpenNow: boolean;
  searchQuery: string;
}

interface BusinessFilterProps {
  onFilterChange?: (filters: FilterData) => void;
  listings?: any[];
}

// ✅ Debounced search hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ✅ Rating Dropdown Content
const RatingDropdownContent = ({ 
  filters, 
  updateFilter, 
  ratingOptions 
}: any) => {
  return (
    <div className="p-3 w-full min-w-[180px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">Rating</h3>
      </div>

      <div className="max-h-60 overflow-y-auto w-full">
        {ratingOptions.map((item: any, index: number) => {
          const isSelected = filters.rating === item.value;

          return (
            <button
              key={index}
              onClick={() => updateFilter('rating', item.value)}
              className={`w-full p-3 mb-1 rounded-md text-sm flex justify-between items-center ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-start text-left flex-1">
                <span className="font-medium">{item.label}</span>
                {item.stars && (
                  <span className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                    {item.stars}
                  </span>
                )}
              </div>
              {isSelected && (
                <span className="w-5 h-5 bg-white text-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0 ml-2">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function BusinessFilter({ onFilterChange, listings = [] }: BusinessFilterProps) {
  const [filters, setFilters] = useState<FilterData>({
    rating: 0,
    sortBy: 'popular',
    hasReviews: false,
    isOpenNow: false,
    searchQuery: ''
  });

  const [activeDropdown, setActiveDropdown] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Extract all searchable data from listings
  const searchableData = useMemo(() => {
    if (!listings || listings.length === 0) return { villages: [], blocks: [], districts: [], categories: [] };
    
    const villages = [...new Set(listings.map(listing => listing.village).filter(Boolean))];
    const blocks = [...new Set(listings.map(listing => listing.block).filter(Boolean))];
    const districts = [...new Set(listings.map(listing => listing.district).filter(Boolean))];
    const categories = [...new Set(listings.map(listing => listing.category).filter(Boolean))];
    
    return { villages, blocks, districts, categories };
  }, [listings]);

  // Rating options for dropdown
  const ratingOptions = useMemo(() => [
    { value: 0, label: 'Any Rating', stars: '' },
    { value: 3, label: '3+ Stars', stars: '⭐⭐⭐' },
    { value: 4, label: '4+ Stars', stars: '⭐⭐⭐⭐' },
    { value: 4.5, label: '4.5+ Stars', stars: '⭐⭐⭐⭐✨' }
  ], []);

  const updateFilter = useCallback((key: keyof FilterData, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };

    setFilters(newFilters);
    setActiveFilter(key);
    if (onFilterChange) onFilterChange(newFilters);
    setActiveDropdown('');
  }, [filters, onFilterChange]);

  const updateSearchQuery = useCallback((query: string) => {
    const newFilters = {
      ...filters,
      searchQuery: query
    };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const getRatingDisplayValue = useCallback((value: any) => {
    const ratingOption = ratingOptions.find(r => r.value === value);
    return ratingOption ? ratingOption.label : 'Rating';
  }, [ratingOptions]);

  const isFilterActive = useCallback((type: string) => {
    return activeFilter === type;
  }, [activeFilter]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ✅ Popular Button - Individual
  const PopularButton = () => {
    const isActive = filters.sortBy === 'popular';
    
    return (
      <button
        onClick={() => updateFilter('sortBy', 'popular')}
        className={`
          resfilter_item gray_whitefill_animat
          flex items-center px-4 py-3 rounded-lg border-0
          transition-all duration-200 ease-in-out
          ${isActive 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
          }
        `}
      >
        <span className="font15 fw500 block-item">
          Popular
        </span>
      </button>
    );
  };

  // ✅ Top Rated Button - Individual
  const TopRatedButton = () => {
    const isActive = filters.sortBy === 'rating';
    
    return (
      <button
        onClick={() => updateFilter('sortBy', 'rating')}
        className={`
          resfilter_item gray_whitefill_animat
          flex items-center px-4 py-3 rounded-lg border-0
          transition-all duration-200 ease-in-out
          ${isActive 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
          }
        `}
      >
        <div className="filcn mr-3">
          <span className="text-lg">🏆</span>
        </div>
        <span className="font15 fw500 block-item">
          Top Rated
        </span>
      </button>
    );
  };

  // ✅ Most Reviews Button - Individual
  const MostReviewsButton = () => {
    const isActive = filters.sortBy === 'reviews';
    
    return (
      <button
        onClick={() => updateFilter('sortBy', 'reviews')}
        className={`
          resfilter_item gray_whitefill_animat
          flex items-center px-4 py-3 rounded-lg border-0
          transition-all duration-200 ease-in-out
          ${isActive 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
          }
        `}
      >
        <span className="font15 fw500 block-item">
          Most Reviews
        </span>
      </button>
    );
  };

  // ✅ Nearest Button - Individual
  const NearestButton = () => {
    const isActive = filters.sortBy === 'distance';
    
    return (
      <button
        onClick={() => updateFilter('sortBy', 'distance')}
        className={`
          resfilter_item gray_whitefill_animat
          flex items-center px-4 py-3 rounded-lg border-0
          transition-all duration-200 ease-in-out
          ${isActive 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
          }
        `}
      >
        <span className="font15 fw500 block-item">
          Nearest
        </span>
      </button>
    );
  };

  // ✅ Rating Button - With Dropdown
  const RatingButton = () => {
    const isActive = isFilterActive('rating');
    const displayValue = getRatingDisplayValue(filters.rating);
    
    return (
      <div className="relative" ref={activeDropdown === 'rating' ? dropdownRef : null}>
        <button
          onClick={() => {
            setActiveDropdown(activeDropdown === 'rating' ? '' : 'rating');
          }}
          aria-haspopup="true"
          aria-expanded={activeDropdown === 'rating' ? "true" : "false"}
          role="combobox"
          tabIndex={0}
          className={`
            resfilter_item gray_whitefill_animat
            flex items-center px-4 py-3 rounded-lg border-0
            transition-all duration-200 ease-in-out
            ${isActive 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
            }
          `}
        >
          <div className="filcn mr-3">
            <span className="text-lg">⭐</span>
          </div>
          
          <span className="font15 fw500 mr-4 block-item">
            {displayValue}
          </span>
          
          <div className={`jdicon filter_drop_icon transition-transform duration-200 ${
            activeDropdown === 'rating' ? 'rotate-180' : ''
          }`}>
            ▼
          </div>
        </button>

        {activeDropdown === 'rating' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
            <RatingDropdownContent 
              filters={filters}
              updateFilter={updateFilter}
              ratingOptions={ratingOptions}
            />
          </div>
        )}
      </div>
    );
  };

  const hasActive = !!activeFilter || !!filters.searchQuery;

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="w-full px-6 py-4">
        
        <div className="flex flex-col gap-4 w-full">
          
          {/* ✅ Header */}
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-bold text-gray-900">Find Businesses</h2>
            
            {hasActive && (
              <button
                onClick={() => {
                  const reset = {
                    rating: 0,
                    sortBy: 'popular',
                    hasReviews: false,
                    isOpenNow: false,
                    searchQuery: ''
                  };
                  setFilters(reset);
                  setActiveFilter('');
                  if (onFilterChange) onFilterChange(reset);
                }}
                className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors duration-200"
              >
                🔄 Reset All
              </button>
            )}
          </div>

          {/* ✅ Main Search Input - Enhanced search */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search for businesses, services, village/block/district or categories..."
              value={filters.searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* ✅ Search Suggestions Info */}
            <div className="mt-2 text-xs text-gray-500">
              <span>Search by: Business name, Service type, Village, Block, District, or Category</span>
            </div>
          </div>

          {/* ✅ Filter Buttons */}
          <div className="flex items-center gap-3 w-full flex-wrap">
            <PopularButton />
            <TopRatedButton />
            <MostReviewsButton />
            <NearestButton />
            <RatingButton />
          </div>

        </div>

      </div>

      {/* ✅ Add CSS for the exact styles */}
      <style jsx>{`
        .resfilter_item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          font-size: 15px;
          font-weight: 500;
          background: #f8f9fa;
          color: #374151;
          white-space: nowrap;
        }
        
        .resfilter_item:hover {
          background: #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .gray_whitefill_animat {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .font15 {
          font-size: 15px;
        }
        
        .fw500 {
          font-weight: 500;
        }
        
        .mr-4 {
          margin-right: 16px;
        }
        
        .mr-3 {
          margin-right: 12px;
        }
        
        .block-item {
          display: block;
        }
        
        .filcn {
          display: flex;
          align-items: center;
        }
        
        .jdicon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .filter_drop_icon {
          font-size: 12px;
          color: #6b7280;
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}