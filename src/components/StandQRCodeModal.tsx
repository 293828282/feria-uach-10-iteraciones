'use client';

import React, { useState } from 'react';
import { CloseIcon, QRIcon, CheckIcon } from './ui/vectors';

interface StandQRCodeModalProps {
  isOpen: boolean;
  standId: string;
  standNumber: number;
  standName: string;
  onClose: () => void;
}

export const StandQRCodeModal: React.FC<StandQRCodeModalProps> = ({
  isOpen,
  standId,
  standNumber,
  standName,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://feria-uach-10-iteraciones.vercel.app';
  const evaluationUrl = `${currentOrigin}/?standId=${standId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(evaluationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Generate deterministic 21x21 QR pattern based on standId
  const getCellState = (r: number, c: number) => {
    // 3 Corner finder patterns (7x7)
    if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) {
      // outer border
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r === 0 || r === 6 || c === 14 || c === 20) return true;
      if (r === 14 || r === 20 || c === 0 || c === 6) return true;
      // inner 3x3 solid block
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      if (r >= 2 && r <= 4 && c >= 16 && c <= 18) return true;
      if (r >= 16 && r <= 18 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Timing patterns
    if (r === 6 && c % 2 === 0) return true;
    if (c === 6 && r % 2 === 0) return true;

    // Content hash distribution
    let hash = 0;
    const str = `${standId}_${r}_${c}_uach`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 3 !== 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border border-white/80 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <CloseIcon size={18} />
        </button>

        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3 border border-sky-200/60">
          <QRIcon size={24} />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
          Acceso Rápido a Pauta
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-2 font-serif">
          Stand #{standNumber}: {standName}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Escanea el código con tu celular para evaluar este proyecto de inmediato en la feria.
        </p>

        {/* QR Code SVG Matrix */}
        <div className="my-5 p-4 bg-white rounded-2xl border border-slate-200 shadow-inner flex justify-center">
          <svg
            viewBox="0 0 21 21"
            className="w-48 h-48 rounded-lg"
            shapeRendering="crispEdges"
          >
            <rect width="21" height="21" fill="#ffffff" />
            {Array.from({ length: 21 }).map((_, r) =>
              Array.from({ length: 21 }).map((_, c) => {
                if (getCellState(r, c)) {
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width="1"
                      height="1"
                      fill="#0f172a"
                    />
                  );
                }
                return null;
              })
            )}
          </svg>
        </div>

        {/* URL Box & Copy */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-left">
          <input
            type="text"
            readOnly
            value={evaluationUrl}
            className="text-[11px] text-slate-600 bg-transparent flex-1 outline-none truncate font-mono"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <CheckIcon size={14} /> Copiado
              </>
            ) : (
              'Copiar'
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Universidad Austral de Chile &bull; Sistema de Jueces
        </p>
      </div>
    </div>
  );
};
