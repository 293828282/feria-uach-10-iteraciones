'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { Stand, EvaluationCriteria, Evaluation } from '@/types/database';
import { CheckIcon, ChevronRightIcon, LightbulbIdeaIcon } from '@/components/ui/vectors';
import { RippleButton } from '@/components/ui/RippleButton';

interface TiltStandCardProps {
  stand: Stand;
  criteria: EvaluationCriteria[];
  standEvaluations: Evaluation[];
  standImg: string;
  isEvaluated: boolean;
  judgeAvg: number;
  onEvaluate: () => void;
}

export const TiltStandCard: React.FC<TiltStandCardProps> = ({
  stand,
  criteria,
  standImg,
  isEvaluated,
  judgeAvg,
  onEvaluate,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -5.5; // Max -5.5 to 5.5 deg
    const rotY = ((x - centerX) / centerX) * 5.5;

    setRotateX(rotX);
    setRotateY(rotY);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.28,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
      }}
      className="squircle-card relative overflow-hidden flex flex-col justify-between group shadow-velvet hover:shadow-velvet-lg will-change-transform"
    >
      {/* Dynamic Specular Glare Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-[28px]"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.8) 0%, transparent 60%)`,
          opacity: glarePos.opacity,
        }}
      />

      <div>
        {/* Image Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 rounded-t-[27px]">
          <Image
            src={standImg}
            alt={stand.project_name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Luminous Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-85" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="rounded-full bg-white/95 border border-sky-300/80 px-3 py-1 text-xs font-mono font-bold text-sky-800 backdrop-blur-md shadow-sm">
              STAND #{stand.stand_number}
            </span>

            {isEvaluated ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/95 border border-purple-300 px-3 py-1 text-[11px] font-semibold text-purple-800 backdrop-blur-md shadow-sm">
                <CheckIcon size={13} className="text-purple-700" />
                Calificado ({judgeAvg.toFixed(1)})
              </span>
            ) : (
              <span className="rounded-full bg-white/90 border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-600 backdrop-blur-md shadow-sm">
                Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-1.5 mb-2.5">
            <LightbulbIdeaIcon size={14} className="text-purple-600 flex-shrink-0" />
            <span className="inline-block rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] text-purple-700 font-semibold uppercase tracking-wider">
              {stand.category || 'General'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-sky-700 transition-colors">
            {stand.project_name}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {stand.team_members}
          </p>
        </div>
      </div>

      {/* Card Footer with RippleButton */}
      <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-slate-200/60 mt-2">
        <span className="text-[11px] text-slate-500 font-mono">
          {criteria.length} criterios oficiales
        </span>

        <RippleButton
          onClick={onEvaluate}
          isActive={isEvaluated}
          className="px-4 py-2 text-xs font-semibold rounded-xl"
        >
          <span>{isEvaluated ? 'Modificar' : 'Evaluar Stand'}</span>
          <ChevronRightIcon size={14} />
        </RippleButton>
      </div>
    </div>
  );
};
