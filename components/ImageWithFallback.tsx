'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  fallbackSrc: string;
  priority?: boolean;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = true,
  className = '',
  fallbackSrc,
  priority = false,
  width,
  height,
  onLoad,
  onError,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
    onError?.();
  };

  const handleLoad = () => {
    setError(false);
    onLoad?.();
  };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {fill ? (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={className}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={true}
        />
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          unoptimized={true}
        />
      )}
    </div>
  );
}