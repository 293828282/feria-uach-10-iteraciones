import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const MedalSilverIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="14" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    <path d="M8.21 13.89 7 2l5 3 5-3-1.21 11.89" />
  </svg>
);
