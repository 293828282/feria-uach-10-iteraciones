'use client';

import React, { useEffect } from 'react';
import { CloseIcon, EyeExpandIcon } from './ui/vectors';

interface StandImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  standName: string;
  category?: string;
  onClose: () => void;
}

export const StandImageLightbox: React.FC<StandImageLightboxProps> = ({
  isOpen,
  imageUrl,
  standName,
  category,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
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

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-white/95 rounded-3xl overflow-hidden shadow-2xl border border-white/60">
        {/* Header */}
        <div className="px-6 py-4 bg-white/90 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                Lámina de Presentación Oficial
              </span>
              {category && (
                <span className="text-[10px] font-semibold text-slate-500">
                  {category}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 font-serif">
              {standName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Cerrar vista previa"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Image Content */}
        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-50 min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Gráfica oficial de ${standName}`}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-lg border border-slate-200"
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-white/90 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Universidad Austral de Chile &bull; Feria de Emprendimiento 2026</span>
          <span className="text-[11px] font-mono">Presiona Esc para cerrar</span>
        </div>
      </div>
    </div>
  );
};
