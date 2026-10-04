import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const NotesLogoIcon: React.FC<IconProps> = ({ className = 'w-8 h-8', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="26" height="26" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
    <path d="M9 10H23" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M9 16H19" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 22H15" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    <circle cx="23" cy="22" r="3" fill="#10b981" />
  </svg>
);
