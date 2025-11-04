'use client';

import { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';

interface ImageSliderProps {
  images: string[];
  alt: string;
  fallbackImage: string;
}

export default function ImageSlider({ images, alt, fallbackImage }: ImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-l-2xl">
      {/* Main Image */}
      <ImageWithFallback 
        src={images[currentImageIndex]} 
        alt={alt}
        fallbackSrc={fallbackImage}
        width={320}
        height={320}
        className="w-full h-full object-cover"
      />
      
      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
      
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
          >
            ‹
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
          >
            ›
          </button>
        </>
      )}
      
      {/* Image Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button 
              key={index} 
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Open Status Badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/90 text-white backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
          Open Now
        </span>
      </div>
    </div>
  );
}