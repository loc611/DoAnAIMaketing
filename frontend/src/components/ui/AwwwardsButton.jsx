import React from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';

export default function AwwwardsButton({ children, onClick, className = '', icon: CustomIcon, href }) {
  const IconComponent = CustomIcon || ArrowUpRight;

  const content = (
    <span className="flex items-center gap-3">
      <span>{children}</span>
      <span className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
        <IconComponent className="w-4 h-4 text-current" weight="bold" />
      </span>
    </span>
  );

  const baseClasses = `group inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-sm transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${className}`;

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
}
