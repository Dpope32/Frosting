import React, { useState, useEffect, useRef } from 'react';
import { isWeb } from 'tamagui';

interface OptimizedVideoProps {
  src: any;
  style?: React.CSSProperties;
  className?: string;
  delay?: number;
}

export const OptimizedVideo = ({ src, style, className, delay = 0 }: OptimizedVideoProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWeb) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setShouldLoad(true);
            setIsInView(true);
          }, delay);
        } else {
          setIsInView(false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  if (!isWeb) return null;

  return (
    <div 
      ref={videoRef} 
      style={style} 
      className={className}
    >
      {shouldLoad && (
        <video
          src={src}
          autoPlay={isInView}
          muted
          loop
          playsInline
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: isInView ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
}; 