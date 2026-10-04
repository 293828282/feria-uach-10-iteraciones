'use client';

import React from 'react';
import { Judge } from '@/types/database';
import { UsersIcon, CloseIcon, CheckIcon } from '@/components/ui/vectors';

interface JudgeSelectorModalProps {
  isOpen: boolean;
  judges: Judge[];
  currentJudge: Judge | null;
  onSelectJudge: (judge: Judge) => void;
  onClose: () => void;
}

export const JudgeSelectorModal: React.FC<JudgeSelectorModalProps> = ({
  isOpen,
  judges,
  currentJudge,
  onSelectJudge,
  onClose,
}) => {
  if (!isOpen) return null;

  const activeJudges = judges.filter((j) => j.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel shadow-2xl overflow-hidden border border-white/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-white/70">
          <div className="flex items-center gap-2.5 text-slate-900">
            <UsersIcon size={18} className="text-sky-700" />
            <h2 className="text-base font-semibold">Identificación de Juez Evaluador</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-light-gray p-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Selecciona tu perfil de jurado oficial para comenzar a calificar los stands de la feria. Tus evaluaciones se asociarán automáticamente a tu cuenta.
          </p>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {activeJudges.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay jueces registrados activos en el sistema.
              </div>
            ) : (
              activeJudges.map((judge) => {
                const isSelected = currentJudge?.id === judge.id;
                return (
                  <button
                    key={judge.id}
                    onClick={() => {
                      onSelectJudge(judge);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'btn-light-gray-active border-sky-400 text-slate-900 shadow-md ring-2 ring-sky-300/50'
                        : 'btn-light-gray text-slate-800 hover:bg-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-purple-100 border border-sky-200 flex items-center justify-center font-bold text-xs text-sky-800 font-mono shadow-sm">
                        {judge.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-slate-900">
                          {judge.full_name}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Jurado Oficial UACh 2026
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs text-sky-700 font-bold">
                        <CheckIcon size={16} />
                        Activo
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white/50 text-right">
          <button
            onClick={onClose}
            className="btn-light-gray px-4 py-2 text-xs font-semibold text-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
