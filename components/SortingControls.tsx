'use client';

interface SortingControlsProps {
  totalListings: number;
  categoryName: string;
  location: string;
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filters: { openNow: boolean; topRated: boolean }) => void;
  currentSort: string;
  currentFilters: { openNow: boolean; topRated: boolean };
}

export default function SortingControls({ 
  totalListings, 
  categoryName, 
  location,
  onSortChange,
  onFilterChange,
  currentSort,
  currentFilters
}: SortingControlsProps) {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value);
  };

  const handleOpenNowToggle = () => {
    onFilterChange({
      ...currentFilters,
      openNow: !currentFilters.openNow
    });
  };

  const handleTopRatedToggle = () => {
    onFilterChange({
      ...currentFilters,
      topRated: !currentFilters.topRated
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Premium Sort Dropdown */}
      <div className="relative flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
        <span className="text-gray-700 font-semibold text-sm">Sort by:</span>
        <select 
          value={currentSort}
          onChange={handleSortChange}
          className="bg-transparent border-none focus:outline-none text-gray-800 font-medium text-sm appearance-none cursor-pointer pr-8"
        >
          <option value="relevance">Relevance</option>
          <option value="rating-high-low">Rating: High to Low</option>
          <option value="rating-low-high">Rating: Low to High</option>
          <option value="distance-near-far">Distance: Near to Far</option>
          <option value="distance-far-near">Distance: Far to Near</option>
          <option value="popularity">Popularity</option>
        </select>
        <div className="absolute right-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Premium Filter Buttons */}
      <div className="flex gap-2 w-full sm:w-auto">
        <button 
          onClick={handleOpenNowToggle}
          className={`group flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-1 sm:flex-none ${
            currentFilters.openNow 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl' 
              : 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:bg-white'
          }`}
        >
          <span className={`text-lg transition-transform duration-200 ${currentFilters.openNow ? 'scale-110' : 'group-hover:scale-110'}`}>
            🕒
          </span>
          <span className="text-sm hidden xs:inline">Open Now</span>
        </button>
        
        <button 
          onClick={handleTopRatedToggle}
          className={`group flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-1 sm:flex-none ${
            currentFilters.topRated 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-2xl' 
              : 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:bg-white'
          }`}
        >
          <span className={`text-lg transition-transform duration-200 ${currentFilters.topRated ? 'scale-110' : 'group-hover:scale-110'}`}>
            ⭐
          </span>
          <span className="text-sm hidden xs:inline">Top Rated</span>
        </button>
      </div>
    </div>
  );
}