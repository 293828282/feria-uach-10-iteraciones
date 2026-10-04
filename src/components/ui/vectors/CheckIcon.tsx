import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const CheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 24 }) => (
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
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
