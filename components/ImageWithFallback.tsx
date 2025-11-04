// components/ImageWithFallback.tsx
'use client';

import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc, 
  className = '', 
  style,
  width = 250,
  height = 300
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc);
        setHasError(true);
      }}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}