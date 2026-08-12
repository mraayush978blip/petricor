import { useState } from 'react';
import Skeleton from './Skeleton';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ProgressiveImage({ src, alt, className = '', style = {} }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background skeleton loader showing while the image downloads */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          opacity: isLoaded ? 0 : 1, 
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none'
        }}
      >
        <Skeleton width="100%" height="100%" borderRadius="0" />
      </div>

      {/* The actual image, fading in when loaded */}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          ...style,
          width: '100%',
          height: '100%',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
          objectFit: style.objectFit || 'cover',
        }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
