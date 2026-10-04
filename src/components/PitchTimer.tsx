'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StopwatchIcon, SoundHighIcon, SoundMuteIcon, RefreshIcon, CheckIcon } from './ui/vectors';
import { soundFX } from '@/lib/soundFx';

interface PitchTimerProps {
  standName?: string;
  onPhaseComplete?: (phaseName: string) => void;
  className?: string;
}

type TimerPhase = 'pitch' | 'qa' | 'deliberation';

interface PhaseConfig {
  id: TimerPhase;
  name: string;
  duration: number; // in seconds
  colorClass: string;
  strokeColor: string;
}

const PHASES: PhaseConfig[] = [
  { id: 'pitch', name: 'Exposición / Pitch', duration: 180, colorClass: 'text-sky-600', strokeColor: '#0284c7' },
  { id: 'qa', name: 'Defensa / Preguntas', duration: 120, colorClass: 'text-lila-600', strokeColor: '#9333ea' },
  { id: 'deliberation', name: 'Pauta & Calificación', duration: 60, colorClass: 'text-amber-600', strokeColor: '#d97706' },
];

export const PitchTimer: React.FC<PitchTimerProps> = ({
  standName,
  onPhaseComplete,
  className = '',
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(PHASES[0].duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFX.getMuted());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activePhase = PHASES[currentPhaseIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle sound
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  // Switch phase
  const handleSelectPhase = (index: number) => {
    setIsRunning(false);
    setCurrentPhaseIndex(index);
    setTimeLeft(PHASES[index].duration);
  };

  // Play / Pause
  const toggleRunning = () => {
    if (!isRunning) {
      soundFX.triggerHaptic(40);
    }
    setIsRunning(!isRunning);
  };

  // Reset current phase
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(activePhase.duration);
    soundFX.triggerHaptic(20);
  };

  // Tick loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Completed
            clearInterval(timerRef.current!);
            setIsRunning(false);
            soundFX.playPhaseTransition();
            soundFX.triggerHaptic([60, 60, 100, 60]);
            if (onPhaseComplete) {
              onPhaseComplete(activePhase.name);
            }
            return 0;
          }
          if (prev <= 6 && prev > 1) {
            soundFX.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, activePhase, onPhaseComplete]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Progress calculation
  const totalDuration = activePhase.duration;
  const progressRatio = Math.max(0, Math.min(1, timeLeft / totalDuration));
  const strokeDashoffset = 283 - 283 * progressRatio; // 2 * PI * 45 ≈ 283
  const isUrgent = timeLeft > 0 && timeLeft <= 15;

  return (
    <div className={`squircle-card p-4 border border-sky-100/80 shadow-md ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100/90 text-sky-700 flex items-center justify-center border border-sky-200/50">
            <StopwatchIcon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Cronómetro de Pitch
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {activePhase.name}
              </span>
            </div>
            {standName && (
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                {standName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {isMuted ? <SoundMuteIcon size={16} /> : <SoundHighIcon size={16} />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            {isExpanded ? 'Compactar' : 'Ajustar'}
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="mt-3 flex items-center justify-between gap-4">
        {/* Progress Ring and Digital Clock */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isUrgent ? '#ef4444' : activePhase.strokeColor}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-linear"
              />
            </svg>
            <span
              className={`absolute text-base font-bold tabular-nums font-mono ${
                isUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-900'
              }`}
            >
              {Math.ceil(timeLeft)}s
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums font-mono tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {timeLeft === 0 ? (
                <span className="text-rose-600 font-bold">Tiempo completado</span>
              ) : isRunning ? (
                <span className="text-emerald-600 font-semibold animate-pulse">En curso...</span>
              ) : (
                'En pausa'
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRunning}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
              isRunning
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95'
            }`}
          >
            {isRunning ? 'Pausar' : timeLeft === 0 ? 'Reiniciar' : 'Iniciar'}
          </button>
          <button
            onClick={resetTimer}
            title="Reiniciar fase actual"
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshIcon size={14} />
          </button>
        </div>
      </div>

      {/* Expanded Phase Switcher */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-200/80">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
            Fases Oficiales de Evaluación UACh
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PHASES.map((phase, idx) => {
              const isSelected = idx === currentPhaseIndex;
              return (
                <button
                  key={phase.id}
                  onClick={() => handleSelectPhase(idx)}
                  className={`px-2 py-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-white border-sky-400 shadow-sm ring-1 ring-sky-300'
                      : 'bg-slate-50/80 hover:bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    {idx + 1}. {phase.id.toUpperCase()}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {phase.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {Math.round(phase.duration / 60)} min
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
