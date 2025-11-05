'use client';

import { useState, useEffect, useMemo } from 'react';
import ImageWithFallback from './ImageWithFallback';

interface ImageSliderProps {
  images: string[];
  alt: string;
  fallbackImage: string;
}

// ✅ Clean validation without console logs
const validateImages = (images: string[]): string[] => {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.filter(img => img && typeof img === 'string' && img.trim() !== '');
};

const NoImagesAvailable = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 rounded-l-2xl">
      <div className="text-center p-6">
        <div className="text-4xl mb-4">📷</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No Images Available
        </h3>
      </div>
    </div>
  );
};

export default function ImageSlider({ images, alt, fallbackImage }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState('');

  const displayImages = useMemo(() => {
    return validateImages(images);
  }, [images]);

  const hasValidImages = displayImages.length > 0;
  const hasMultipleImages = displayImages.length > 1;

  // ✅ Track current image source
  useEffect(() => {
    if (hasValidImages) {
      setCurrentImageSrc(displayImages[currentIndex]);
      setImageLoaded(false);
    }
  }, [currentIndex, displayImages, hasValidImages]);

  // Reset when images change
  useEffect(() => {
    setCurrentIndex(0);
    setImageLoaded(false);
    if (hasValidImages) {
      setCurrentImageSrc(displayImages[0]);
    }
  }, [displayImages, hasValidImages]);

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true);
  };

  // If no valid images
  if (!hasValidImages) {
    return <NoImagesAvailable />;
  }

  return (
    <div className="relative w-full h-full rounded-l-2xl overflow-hidden">
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-l-2xl z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading image...</p>
            </div>
          </div>
        )}
        
        {/* Main Image */}
        <ImageWithFallback
          key={currentImageSrc}
          src={currentImageSrc}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          fallbackSrc={fallbackImage}
          priority={currentIndex === 0}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-20"
            disabled={!imageLoaded}
          >
            ←
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-20"
            disabled={!imageLoaded}
          >
            →
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {hasMultipleImages && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              disabled={!imageLoaded}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium z-20">
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}
    </div>
  );
}