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
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
        <span className="text-gray-600 font-medium">Sort:</span>
        <select 
          value={currentSort}
          onChange={handleSortChange}
          className="bg-transparent border-none focus:outline-none text-gray-800 font-medium"
        >
          <option value="relevance">Relevance</option>
          <option value="rating-high-low">Rating: High to Low</option>
          <option value="rating-low-high">Rating: Low to High</option>
          <option value="distance-near-far">Distance: Near to Far</option>
          <option value="distance-far-near">Distance: Far to Near</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleOpenNowToggle}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
            currentFilters.openNow 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>🕒</span>
          <span>Open Now</span>
        </button>
        
        <button 
          onClick={handleTopRatedToggle}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
            currentFilters.topRated 
              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>⭐</span>
          <span>Top Rated</span>
        </button>
      </div>
    </div>
  );
}