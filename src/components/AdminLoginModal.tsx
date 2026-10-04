'use client';

import React, { useState } from 'react';
import { LockIcon, CloseIcon } from '@/components/ui/vectors';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'Clemeva' || password.trim().toLowerCase() === 'clemeva') {
      setPassword('');
      setErrorMsg('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Clave administrativa incorrecta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
          <div className="flex items-center gap-2.5 text-slate-900">
            <LockIcon size={18} className="text-sky-700" />
            <h3 className="font-semibold text-sm">Control Administrativo</h3>
          </div>
          <button
            onClick={onClose}
            className="btn-light-gray p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Ingresa la clave de administración para acceder a la gestión de stands, preguntas y métricas del jurado.
          </p>

          {errorMsg && (
            <div className="rounded-xl border border-red-300 bg-red-50/80 px-3 py-2 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="admin-pwd" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Clave de Acceso
            </label>
            <input
              id="admin-pwd"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="••••••••••••"
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-light-gray px-3.5 py-2 text-xs font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-light-gray-active flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm"
            >
              <LockIcon size={14} />
              <span>Desbloquear Panel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
