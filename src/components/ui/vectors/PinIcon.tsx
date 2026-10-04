import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  filled?: boolean;
}

export const PinIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 24, filled = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-2l-3-3V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7l-3 3v2z" />
  </svg>
);
