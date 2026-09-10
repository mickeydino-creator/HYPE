import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

// Shimmering skeleton while an image loads, and a neutral icon instead of a
// broken-image box if it fails — used everywhere trend/user images render,
// so a slow or missing image never looks like an empty gray rectangle.
export default function SmartImage({ src, alt, className = '', imgClassName = '' }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStatus('loading');
    // For instant/cached images (data URIs especially) the browser can fire
    // `load` before React has attached the onLoad handler below, leaving
    // the element stuck at opacity-0 forever — check `complete` on mount too.
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setStatus('loaded');
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-base-muted ${className}`}>
      {status !== 'loaded' && (
        <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,#F1F3F8_35%,#FBFCFE_50%,#F1F3F8_65%)] bg-[length:250%_100%]" />
      )}
      {status === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center text-ink-300">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m5 17 4.5-4.5L12 15l3.5-3.5L21 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`h-full w-full object-cover ${status === 'loaded' ? 'animate-img-in' : 'opacity-0'} ${imgClassName}`}
        />
      )}
    </div>
  );
}
