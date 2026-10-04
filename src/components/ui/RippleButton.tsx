'use client';

import React, { useState, useRef, MouseEvent } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  rippleColor?: string;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  isActive = false,
  className = '',
  rippleColor = 'rgba(56, 189, 248, 0.35)',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.8;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const newRipple = { x, y, size, id: Date.now() };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 650);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const baseClass = isActive ? 'btn-light-gray-active' : 'btn-light-gray';

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden transition-all duration-200 active:scale-[0.98] ${baseClass} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-1.5 pointer-events-none">
        {children}
      </span>

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full animate-ripple"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: rippleColor,
          }}
        />
      ))}
    </button>
  );
};
