'use client';

import React, { useMemo, useState } from 'react';
import { EvaluationCriteria } from '@/types/database';

interface StandRadarChartProps {
  criteria: EvaluationCriteria[];
  scores: Record<string, number>;
  benchmarkScores?: Record<string, number>;
  size?: number;
  className?: string;
  showLegend?: boolean;
}

export const StandRadarChart: React.FC<StandRadarChartProps> = ({
  criteria,
  scores,
  benchmarkScores,
  size = 320,
  className = '',
  showLegend = true,
}) => {
  const [hoveredCritId, setHoveredCritId] = useState<string | null>(null);

  const activeCriteria = useMemo(() => criteria.filter((c) => c.is_active), [criteria]);

  const count = activeCriteria.length;
  const center = size / 2;
  const radius = size * 0.36;

  // Levels for concentric polygon web (1 to 7)
  const levels = [2, 4, 6, 7];

  // Calculate stand polygon points
  const standPolygonPoints = useMemo(() => {
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

  // Calculate benchmark polygon points
  const benchmarkPolygonPoints = useMemo(() => {
    if (count < 3 || !benchmarkScores) return '';

    return activeCriteria
      .map((crit, i) => {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        const score = benchmarkScores[crit.id] || 4.0;
        const normalized = Math.max(1, Math.min(score, 7)) / 7;
        const r = radius * normalized;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [activeCriteria, benchmarkScores, count, center, radius]);

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
          const isHovered = hoveredCritId === crit.id;

          return (
            <g
              key={crit.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCritId(crit.id)}
              onMouseLeave={() => setHoveredCritId(null)}
            >
              {/* Spoke line */}
              <line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke={isHovered ? '#0284c7' : 'rgba(186, 230, 253, 0.8)'}
                strokeWidth={isHovered ? 2 : 1.2}
              />

              {/* Text Badge */}
              <text
                x={labelX}
                y={labelY - 3}
                textAnchor="middle"
                className={`text-[9.5px] font-semibold font-sans transition-colors ${
                  isHovered ? 'fill-sky-800 font-bold' : 'fill-slate-700'
                }`}
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

        {/* Benchmark / Fair Cohort Average Polygon */}
        {benchmarkPolygonPoints && (
          <polygon
            points={benchmarkPolygonPoints}
            fill="none"
            stroke="#c084fc"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            strokeLinejoin="round"
            opacity="0.85"
            className="transition-all duration-500 ease-out"
          />
        )}

        {/* Stand Evaluated Area Polygon */}
        {standPolygonPoints && (
          <>
            <polygon
              points={standPolygonPoints}
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
              const isHovered = hoveredCritId === crit.id;

              return (
                <circle
                  key={crit.id}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? '6.5' : '4.5'}
                  fill="#ffffff"
                  stroke={isHovered ? '#9333ea' : '#0284c7'}
                  strokeWidth={isHovered ? '2.5' : '2'}
                  className="transition-all duration-300 ease-out"
                />
              );
            })}
          </>
        )}

        {/* Center dot */}
        <circle cx={center} cy={center} r="3" fill="#94a3b8" />
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 border border-white shadow-xs" />
            <span className="font-semibold text-slate-800">Evaluación del Stand</span>
          </div>
          {benchmarkScores && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 border-t-2 border-dashed border-lila-500" />
              <span className="text-slate-600">Promedio de la Feria</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
