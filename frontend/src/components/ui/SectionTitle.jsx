import React from 'react';

/**
 * Apple-style section title with optional badge and subtitle
 */
export default function SectionTitle({
  badge,
  badgeColor = 'text-blue-400',
  title,
  subtitle,
  gradient,
  align = 'center',
  className = '',
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-4xl ${alignClass} ${className}`}>
      {badge && (
        <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${badgeColor}`}>
          {badge}
        </p>
      )}
      <h2 className={`${badge ? 'mt-3' : ''} text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl`}>
        {gradient ? (
          <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {title}
          </span>
        ) : (
          title
        )}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#86868b] md:text-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
