import React from 'react';

/**
 * Apple-style badge pill (e.g., "Mới", "NEW", "Hot")
 */
export default function Badge({ children, color = 'blue', className = '' }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    white: 'bg-white/10 text-white border-white/20',
  };

  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
