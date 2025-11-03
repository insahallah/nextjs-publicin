'use client';

import { useState } from 'react';

interface ListingImageProps {
  src: string;
  alt: string;
  fallbackSrc: string;
}

export default function ListingImage({ src, alt, fallbackSrc }: ListingImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img 
      src={imgSrc} 
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      style={{ 
        width: '100%', 
        height: 'auto', 
        objectFit: 'cover' 
      }}
    />
  );
}