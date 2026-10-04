import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const RadarChartIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon points="12 2 22 8.5 18 20 6 20 2 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <polygon points="12 6 18 10.5 15.5 17 8.5 17 6 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="22" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="18" y1="20" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="6" y1="20" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="2" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const ConfettiSparkleIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 2L13.5 8L19.5 9.5L13.5 11L12 17L10.5 11L4.5 9.5L10.5 8L12 2Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M19 16L19.8 19L23 20L19.8 21L19 24L18.2 21L15 20L18.2 19L19 16Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    <circle cx="18" cy="5" r="1.2" fill="currentColor" />
  </svg>
);

export const JudgeGavelIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14 13L4 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 3L11 8L13 10L18 5L16 3Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13 10L8 15L10 17L15 12L13 10Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M20 7L17 10L19 12L22 9L20 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="2" y1="21" x2="8" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const LightbulbIdeaIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M9 18H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 22H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 2C7.58 2 4 5.58 4 10C4 12.8 5.43 15.26 7.6 16.7C8.1 17.03 8.4 17.58 8.4 18.18V18.2H15.6V18.18C15.6 17.58 15.9 17.03 16.4 16.7C18.57 15.26 20 12.8 20 10C20 5.58 16.42 2 12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9.5 8L11.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const TrendingGrowthIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7H22V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TargetGoalIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const AwardLaurelIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M8.2 5.5C7.2 6.5 6.5 7.8 6.2 9.2C5.9 10.6 6 12 6.5 13.3C7 14.6 7.9 15.7 9 16.5C10.1 17.3 11.4 17.8 12.8 17.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15.8 5.5C16.8 6.5 17.5 7.8 17.8 9.2C18.1 10.6 18 12 17.5 13.3C17 14.6 16.1 15.7 15 16.5C13.9 17.3 12.6 17.8 11.2 17.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 5L5.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4.5 8L2.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4.5 12L2.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5.5 16L4 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 5L18.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.5 8L21.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.5 12L21.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18.5 16L20 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const UniversityShieldIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 2L4 5V11C4 16.5 7.5 21.2 12 22C16.5 21.2 20 16.5 20 11V5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 6V17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8 10L12 7L16 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 14H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const StopwatchIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 9V13L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5V2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 2H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M18.5 6.5L20 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const SoundHighIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
    <path d="M15.54 8.46C16.48 9.4 17 10.65 17 12C17 13.35 16.48 14.6 15.54 15.54" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M19.07 4.93C20.95 6.8 22 9.3 22 12C22 14.7 20.95 17.2 19.07 19.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const SoundMuteIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
    <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const QRIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5" y="5" width="3" height="3" fill="currentColor" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="16" y="5" width="3" height="3" fill="currentColor" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5" y="16" width="3" height="3" fill="currentColor" />
    <path d="M14 14H17V17H14V14Z" fill="currentColor" />
    <path d="M18 18H21V21H18V18Z" fill="currentColor" />
    <path d="M14 19H16V21H14V19Z" fill="currentColor" />
    <path d="M19 14H21V16H19V14Z" fill="currentColor" />
  </svg>
);

export const CloudCheckIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M6.5 19C4.01 19 2 16.99 2 14.5C2 12.18 3.75 10.28 6.04 10.03C6.54 6.64 9.45 4 13 4C17.14 4 20.5 7.36 20.5 11.5C20.5 11.84 20.48 12.17 20.43 12.5C21.94 13.25 23 14.76 23 16.5C23 18.99 20.99 21 18.5 21H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 15.5L11 18L16.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StandBoothIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M3 10V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M2 5L4 10H20L22 5L18 3L12 5L6 3L2 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
    <path d="M7 10V16C7 16.55 7.45 17 8 17H16C16.55 17 17 16.55 17 16V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const EyeExpandIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21H3V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 3L14 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 21L10 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DownloadDocIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 18V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M9 15L12 18L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const QuotesIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M10 11H6C4.9 11 4 10.1 4 9V7C4 5.9 4.9 5 6 5H8C9.1 5 10 5.9 10 7V17C10 18.1 9.1 19 8 19H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 11H16C14.9 11 14 10.1 14 9V7C14 5.9 14.9 5 16 5H18C19.1 5 20 5.9 20 7V17C20 18.1 19.1 19 18 19H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRightCircleIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 8L14 12L10 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowLeftCircleIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 16L10 12L14 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
