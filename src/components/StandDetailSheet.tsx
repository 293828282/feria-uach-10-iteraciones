'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Stand, EvaluationCriteria, Evaluation } from '@/types/database';
import {
  CloseIcon,
  UsersIcon,
  LightbulbIdeaIcon,
  TargetGoalIcon,
  QRIcon,
  ClipboardCheckIcon,
  CheckIcon,
  EyeExpandIcon,
} from '@/components/ui/vectors';
import { RippleButton } from '@/components/ui/RippleButton';

interface StandDetailSheetProps {
  isOpen: boolean;
  stand: Stand | null;
  criteria: EvaluationCriteria[];
  evaluations: Evaluation[];
  onClose: () => void;
  onStartEvaluation: (stand: Stand) => void;
  onOpenImage: (imageUrl: string, name: string, category: string) => void;
  onOpenQR: (stand: Stand) => void;
}

function getStandImage(standNumber: string) {
  const clean = standNumber.replace(/\D/g, '').padStart(2, '0');
  const valid = ['01', '02', '03', '04', '05', '06'];
  return valid.includes(clean) ? `/stands/stand-${clean}.jpg` : '/stands/stand-01.jpg';
}

export const StandDetailSheet: React.FC<StandDetailSheetProps> = ({
  isOpen,
  stand,
  criteria,
  evaluations,
  onClose,
  onStartEvaluation,
  onOpenImage,
  onOpenQR,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !stand) return null;

  const standImg = stand.image_url || getStandImage(stand.stand_number);
  const standEvals = evaluations.filter((e) => e.stand_id === stand.id);
  const isCompleted = standEvals.length >= criteria.length && criteria.length > 0;
  const avg =
    standEvals.length > 0
      ? standEvals.reduce((acc, curr) => acc + Number(curr.score), 0) / standEvals.length
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in flex justify-end">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col justify-between border-l border-white/80 z-10 overflow-y-auto">
        <div>
          {/* Header Image & Controls */}
          <div className="relative h-64 w-full bg-slate-100">
            <Image
              src={standImg}
              alt={stand.project_name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

            {/* Top action buttons */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold text-sky-900 shadow-sm tabular-nums">
                STAND #{stand.stand_number}
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm backdrop-blur-md transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Floating Banner Tools */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="rounded-full bg-purple-900/80 border border-purple-400/40 px-3 py-0.5 text-xs font-semibold backdrop-blur-md">
                {stand.category || 'General'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenImage(standImg, stand.project_name, stand.category || 'General')}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
                  title="Ampliar Lámina"
                >
                  <EyeExpandIcon size={16} />
                </button>
                <button
                  onClick={() => onOpenQR(stand)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
                  title="Código QR"
                >
                  <QRIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Ficha Técnica Oficial &bull; UACh Sede Puerto Montt
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2 font-serif leading-snug">
                {stand.project_name}
              </h2>
            </div>

            {/* Team Card */}
            <div className="squircle-card p-4 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                <UsersIcon size={16} className="text-sky-700" />
                <span>Equipo Emprendedor</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {stand.team_members || 'Integrantes del proyecto de la Sede Puerto Montt.'}
              </p>
            </div>

            {/* Evaluation Status Card */}
            <div className="squircle-card p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheckIcon size={16} className="text-purple-700" />
                  <span>Estado de la Evaluación</span>
                </span>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <CheckIcon size={13} className="text-emerald-600" />
                    Calificado
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Pendiente
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-600">Promedio actual:</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {avg > 0 ? `${avg.toFixed(2)} / 7.00` : '---'}
                </span>
              </div>
            </div>

            {/* Criteria Overview List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 font-serif">
                Dimensiones de la Pauta ({criteria.length} criterios)
              </h4>
              <div className="space-y-1.5">
                {criteria.map((c, i) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-800 truncate pr-2 font-medium">
                      {i + 1}. {c.question_text}
                    </span>
                    <span className="font-mono text-[11px] text-sky-700 font-bold flex-shrink-0 tabular-nums">
                      {Number(c.weight || 1.0).toFixed(1)}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-6 border-t border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={onClose}
            className="btn-light-gray flex-1 py-3 text-xs font-semibold rounded-2xl"
          >
            Cerrar Ficha
          </button>
          <RippleButton
            onClick={() => {
              onClose();
              onStartEvaluation(stand);
            }}
            isActive={true}
            className="flex-1 py-3 text-xs font-bold rounded-2xl shadow-md"
          >
            <span>{isCompleted ? 'Editar Nota' : 'Evaluar Ahora'}</span>
          </RippleButton>
        </div>
      </div>
    </div>
  );
};
