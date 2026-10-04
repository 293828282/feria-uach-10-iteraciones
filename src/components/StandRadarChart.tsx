'use client';

import React, { useMemo } from 'react';
import { EvaluationCriteria } from '@/types/database';

interface StandRadarChartProps {
  criteria: EvaluationCriteria[];
  scores: Record<string, number>;
  size?: number;
  className?: string;
}

export const StandRadarChart: React.FC<StandRadarChartProps> = ({
  criteria,
  scores,
  size = 320,
  className = '',
}) => {
  const activeCriteria = useMemo(() => criteria.filter((c) => c.is_active), [criteria]);

  const count = activeCriteria.length;
  const center = size / 2;
  const radius = size * 0.38;

  // Generate levels for concentric polygon web (from 1 to 7)
  const levels = [2, 4, 6, 7];

  // Calculate polygon points for each score
  const polygonPoints = useMemo(() => {
    if (count < 3) return '';

    return activeCriteria
      .map((crit, i) => {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        const score = scores[crit.id] || 1;
        const normalized = Math.max(1, Math.min(score, 7)) / 7;
        const r = radius * normalized;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [activeCriteria, scores, count, center, radius]);

  if (count < 3) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 font-mono">
        Se requieren al menos 3 criterios para renderizar la matriz radar.
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none drop-shadow-sm"
      >
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Guide Polygons */}
        {levels.map((lvl) => {
          const lvlRadius = (radius * lvl) / 7;
          const points = activeCriteria
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
              const x = center + lvlRadius * Math.cos(angle);
              const y = center + lvlRadius * Math.sin(angle);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <polygon
              key={lvl}
              points={points}
              fill={lvl % 2 === 0 ? 'rgba(224, 242, 254, 0.35)' : 'none'}
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="1"
              strokeDasharray={lvl === 7 ? 'none' : '3 3'}
            />
          );
        })}

        {/* Axis Lines & Labels */}
        {activeCriteria.map((crit, i) => {
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);

          // Position text label outside
          const labelDist = radius + 22;
          const labelX = center + labelDist * Math.cos(angle);
          const labelY = center + labelDist * Math.sin(angle);

          // Truncate long criteria questions
          const shortTitle =
            crit.question_text.length > 18
              ? crit.question_text.substring(0, 16) + '...'
              : crit.question_text;

          const currentVal = scores[crit.id] || 0;

          return (
            <g key={crit.id}>
              {/* Spoke line */}
              <line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="rgba(186, 230, 253, 0.8)"
                strokeWidth="1.2"
              />

              {/* Text Badge */}
              <text
                x={labelX}
                y={labelY - 3}
                textAnchor="middle"
                className="text-[9.5px] font-semibold fill-slate-700 font-sans"
              >
                {shortTitle}
              </text>
              <text
                x={labelX}
                y={labelY + 9}
                textAnchor="middle"
                className="text-[9px] font-mono font-bold fill-sky-700"
              >
                {currentVal > 0 ? `${currentVal.toFixed(1)} / 7` : 'Pendiente'}
              </text>
            </g>
          );
        })}

        {/* The Evaluated Area Polygon */}
        {polygonPoints && (
          <>
            <polygon
              points={polygonPoints}
              fill="url(#radarGradient)"
              stroke="url(#radarStroke)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              filter="url(#softGlow)"
              className="transition-all duration-500 ease-out"
            />

            {/* Glowing Vertices */}
            {activeCriteria.map((crit, i) => {
              const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
              const score = scores[crit.id] || 1;
              const normalized = Math.max(1, Math.min(score, 7)) / 7;
              const r = radius * normalized;
              const cx = center + r * Math.cos(angle);
              const cy = center + r * Math.sin(angle);

              return (
                <circle
                  key={crit.id}
                  cx={cx}
                  cy={cy}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2"
                  className="transition-all duration-500 ease-out hover:scale-125"
                />
              );
            })}
          </>
        )}

        {/* Center dot */}
        <circle cx={center} cy={center} r="3" fill="#94a3b8" />
      </svg>
    </div>
  );
};
