'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Judge } from '@/types/database';
import { supabase } from '@/lib/supabase';
import {
  SearchIcon,
  PlusIcon,
  LockIcon,
  CloseIcon,
  SaveIcon,
  ChevronRightIcon,
} from '@/components/ui/vectors';

interface WelcomeJudgeGateProps {
  judges: Judge[];
  onSelectJudge: (judge: Judge) => void;
  onOpenAdmin: () => void;
  onRefreshJudges: () => void;
}

export const WelcomeJudgeGate: React.FC<WelcomeJudgeGateProps> = ({
  judges,
  onSelectJudge,
  onOpenAdmin,
  onRefreshJudges,
}) => {
  const [filterText, setFilterText] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeJudges = useMemo(() => judges.filter((j) => j.is_active), [judges]);

  const filteredJudges = useMemo(() => {
    const q = filterText.toLowerCase().trim();
    if (!q) return activeJudges;
    return activeJudges.filter((j) => j.full_name.toLowerCase().includes(q));
  }, [activeJudges, filterText]);

  const handleRegisterNewJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('judges')
        .insert([{ full_name: newJudgeName.trim(), is_active: true }])
        .select()
        .single();

      if (error) throw error;

      setIsRegisterOpen(false);
      setNewJudgeName('');
      onRefreshJudges();
      if (data) {
        onSelectJudge(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el jurado.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Celeste & Lila Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[340px] bg-sky-300/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-[480px] h-[300px] bg-purple-300/40 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Glassmorphic Welcome Card */}
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl z-10 animate-fade-in border border-white/70">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-16 h-16 rounded-2xl p-2 bg-white/95 border border-sky-200 shadow-md mb-4 flex items-center justify-center">
            <Image
              src="/uach-logo.webp"
              alt="Universidad Austral de Chile"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>

          <span className="inline-block rounded-full bg-sky-100 border border-sky-300 px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-sky-800 font-semibold mb-2.5">
            Universidad Austral de Chile &bull; Feria 2026
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            ¿Qué juez eres tú?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
            Identifica tu perfil para ingresar a la pauta de evaluación en terreno y registrar las calificaciones de los stands.
          </p>
        </div>

        {/* Real-time Search Filter */}
        <div className="mb-6 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sky-600">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Escribe tu nombre para filtrar jueces disponibles..."
            className="w-full rounded-2xl glass-input pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
            autoFocus
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs text-slate-500 hover:text-slate-800"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtered Judges List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-6 scrollbar-thin">
          {filteredJudges.length === 0 ? (
            <div className="py-8 text-center glass-card rounded-2xl p-6 border border-slate-200">
              <p className="text-xs text-slate-600 mb-3">
                No encontramos a ningún juez con el nombre &quot;{filterText}&quot;.
              </p>
              <button
                onClick={() => {
                  setNewJudgeName(filterText);
                  setIsRegisterOpen(true);
                }}
                className="btn-light-gray inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
              >
                <PlusIcon size={14} />
                <span>Registrarme como nuevo juez</span>
              </button>
            </div>
          ) : (
            filteredJudges.map((judge) => (
              <button
                key={judge.id}
                onClick={() => onSelectJudge(judge)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-card text-left group border border-white/60 hover:border-sky-400/50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center font-bold text-xs text-sky-800 font-mono flex-shrink-0 shadow-sm">
                    {judge.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                      {judge.full_name}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Jurado Evaluador Titular &bull; UACh 2026
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-purple-700 transition-colors">
                  <span className="hidden sm:inline">Ingresar</span>
                  <ChevronRightIcon size={16} />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Bottom Options (Register New Judge & Admin Login) */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={() => {
              setNewJudgeName('');
              setIsRegisterOpen(true);
            }}
            className="btn-light-gray flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-medium"
          >
            <PlusIcon size={14} />
            <span>¿No apareces en la lista? Regístrate aquí</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="btn-light-gray flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-medium"
          >
            <LockIcon size={13} />
            <span>Acceso Comité Administrador</span>
          </button>
        </div>
      </div>

      {/* Quick Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-semibold text-sm text-slate-900">Registrar Nuevo Jurado</h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterNewJudge} className="space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-red-500/30 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="gate-new-judge" className="block text-[11px] font-medium text-slate-700 mb-1 uppercase tracking-wider">
                  Tu Nombre Completo y Título
                </label>
                <input
                  id="gate-new-judge"
                  type="text"
                  value={newJudgeName}
                  onChange={(e) => setNewJudgeName(e.target.value)}
                  placeholder="Ej. Clemente Caro Mallol"
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="btn-light-gray rounded-xl px-4 py-2 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-light-gray-active flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50"
                >
                  <SaveIcon size={14} />
                  <span>{isSaving ? 'Guardando...' : 'Comenzar como Juez'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
