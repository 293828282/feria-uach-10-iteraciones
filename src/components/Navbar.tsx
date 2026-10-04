'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Judge } from '@/types/database';
import {
  UsersIcon,
  LockIcon,
  LogoutIcon,
  AwardTrophyIcon,
  SoundHighIcon,
  SoundMuteIcon,
  CloudCheckIcon,
} from '@/components/ui/vectors';
import { RippleButton } from '@/components/ui/RippleButton';
import { useOnlineStatus } from '@/lib/useOnlineStatus';
import { soundFX } from '@/lib/soundFx';

interface NavbarProps {
  currentJudge: Judge | null;
  onOpenJudgeSelector: () => void;
  onClearJudge: () => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
  activeView: 'judge' | 'podium' | 'admin';
  setActiveView: (view: 'judge' | 'podium' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentJudge,
  onOpenJudgeSelector,
  onClearJudge,
  isAdmin,
  onOpenAdminModal,
  onLogoutAdmin,
  activeView,
  setActiveView,
}) => {
  const isOnline = useOnlineStatus();
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFX.getMuted());

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  return (
    <header className="sticky top-2 z-40 px-3 sm:px-6 pt-2">
      <div className="max-w-7xl mx-auto rounded-3xl squircle-card px-4 sm:px-6 py-3 flex items-center justify-between border border-white/95 shadow-velvet">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-sky-300/80 bg-white/95 flex-shrink-0 flex items-center justify-center shadow-sm">
            <Image
              src="/uach-logo.webp"
              alt="Universidad Austral de Chile"
              width={38}
              height={38}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 font-serif">
                Feria Emprendimiento UACh 2026
              </span>
              <span className="hidden sm:inline-block rounded-full bg-purple-100 border border-purple-300 px-2.5 py-0.5 text-[10px] font-mono uppercase text-purple-800 font-semibold">
                Pauta Oficial
              </span>
            </div>
            <p className="text-[11px] text-sky-800 font-medium hidden sm:block">
              Facultad de Ciencias Económicas y Administrativas &bull; Sede Puerto Montt
            </p>
          </div>
        </div>

        {/* Actions & Navigation with Ripple Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={isMuted ? 'Activar sonido de la plataforma' : 'Silenciar sonido'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-white/70 hover:bg-white border border-slate-200/80 transition-colors shadow-xs"
          >
            {isMuted ? <SoundMuteIcon size={16} /> : <SoundHighIcon size={16} />}
          </button>

          {/* Active View Selector Island (Jueces / Podio / Admin) */}
          <div className="flex items-center rounded-2xl border border-slate-300/80 bg-white/80 p-1 shadow-sm">
            <RippleButton
              onClick={() => setActiveView('judge')}
              isActive={activeView === 'judge'}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border-none shadow-none"
            >
              <UsersIcon size={14} />
              <span className="hidden sm:inline">Stands</span>
            </RippleButton>

            <RippleButton
              onClick={() => setActiveView('podium')}
              isActive={activeView === 'podium'}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border-none shadow-none"
            >
              <AwardTrophyIcon size={14} className={activeView === 'podium' ? 'text-amber-500' : ''} />
              <span className="hidden sm:inline">Podio</span>
            </RippleButton>

            <RippleButton
              onClick={() => {
                if (isAdmin) {
                  setActiveView('admin');
                } else {
                  onOpenAdminModal();
                }
              }}
              isActive={activeView === 'admin'}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border-none shadow-none"
            >
              <LockIcon size={14} />
              <span className="hidden sm:inline">Admin</span>
            </RippleButton>
          </div>

          {/* Current Judge Indicator in Judge Mode */}
          {activeView === 'judge' && (
            <div className="flex items-center gap-2">
              {currentJudge ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-300/80 bg-white/90 px-2.5 sm:px-3 py-1.5 shadow-sm">
                  <div className="text-left hidden md:block">
                    <span className="block text-[10px] uppercase font-mono text-purple-700 font-semibold">
                      Juez Activo
                    </span>
                    <span className="block text-xs font-bold text-slate-800 truncate max-w-[130px]">
                      {currentJudge.full_name}
                    </span>
                  </div>
                  <RippleButton
                    onClick={onClearJudge}
                    title="Cambiar Juez"
                    className="rounded-lg p-1 text-slate-500 hover:text-purple-700"
                  >
                    <LogoutIcon size={15} />
                  </RippleButton>
                </div>
              ) : (
                <RippleButton
                  onClick={onOpenJudgeSelector}
                  className="rounded-2xl px-3 sm:px-3.5 py-1.5 text-xs font-semibold"
                >
                  <span className="hidden sm:inline">Seleccionar Juez</span>
                  <span className="sm:hidden">Juez</span>
                </RippleButton>
              )}
            </div>
          )}

          {/* Admin Logout Button */}
          {isAdmin && activeView === 'admin' && (
            <RippleButton
              onClick={onLogoutAdmin}
              className="flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-600"
            >
              <LogoutIcon size={14} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </RippleButton>
          )}
        </div>
      </div>
    </header>
  );
};
