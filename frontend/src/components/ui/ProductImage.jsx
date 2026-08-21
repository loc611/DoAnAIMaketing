import React, { useState } from 'react';

/**
 * Reusable ProductImage Component
 * Automatically applies `mix-blend-multiply` with `isolation: isolate` on a neutral light background
 * to make uploaded product images with white/light backgrounds blend seamlessly into any UI card/container.
 */
export default function ProductImage({
  src,
  alt = 'Sản phẩm',
  className = 'w-full h-full object-contain',
  containerClassName = '',
  fallbackSrc = '/images/iphone17_pro/cosmic_orange_iphone_hero.png',
  enableBlend = true,
  loading = 'lazy',
  style = {},
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Sync state if src changes
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${
        enableBlend ? 'isolate' : ''
      } ${containerClassName}`}
      style={{ isolation: enableBlend ? 'isolate' : 'auto' }}
    >
      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        className={`${className} ${
          enableBlend ? 'mix-blend-multiply' : ''
        } transition-all duration-300`}
        style={style}
        {...props}
      />
    </div>
  );
}
