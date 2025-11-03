// components/ImageWithFallback.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc, 
  className = '', 
  style 
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      width={350}
      height={500}
      className={className}
      style={style}
    />
  );
}