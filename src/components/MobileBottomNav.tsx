'use client';

import React from 'react';
import {
  StandBoothIcon,
  ClipboardCheckIcon,
  AwardTrophyIcon,
  LockIcon,
  UsersIcon,
} from './ui/vectors';

interface MobileBottomNavProps {
  currentTab: 'judge' | 'podium' | 'admin';
  onChangeTab: (tab: 'judge' | 'podium' | 'admin') => void;
  selectedStandId: string | null;
  onOpenEvaluation: () => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  currentJudgeName?: string | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onChangeTab,
  selectedStandId,
  onOpenEvaluation,
  isAdmin,
  onOpenAdminLogin,
  currentJudgeName,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_25px_-5px_rgba(56,189,248,0.15)] pb-[max(env(safe-area-inset-bottom),10px)] pt-2 px-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab: Stands */}
        <button
          onClick={() => onChangeTab('judge')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
            currentTab === 'judge' && !selectedStandId
              ? 'text-sky-700 font-bold bg-sky-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          style={{ minHeight: '48px' }}
        >
          <StandBoothIcon size={20} className={currentTab === 'judge' && !selectedStandId ? 'text-sky-600' : ''} />
          <span className="text-[10px] mt-1 tracking-tight">Catálogo</span>
        </button>

        {/* Action: Mi Evaluación / Stand Activo */}
        <button
          onClick={onOpenEvaluation}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all relative ${
            selectedStandId
              ? 'text-lila-700 font-bold bg-lila-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          style={{ minHeight: '48px' }}
        >
          <div className="relative">
            <ClipboardCheckIcon size={20} className={selectedStandId ? 'text-lila-600' : ''} />
            {currentJudgeName && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
            {selectedStandId ? 'Evaluando' : 'Pauta'}
          </span>
        </button>

        {/* Tab: Podio Oficial */}
        <button
          onClick={() => onChangeTab('podium')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
            currentTab === 'podium'
              ? 'text-amber-700 font-bold bg-amber-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          style={{ minHeight: '48px' }}
        >
          <AwardTrophyIcon size={20} className={currentTab === 'podium' ? 'text-amber-500' : ''} />
          <span className="text-[10px] mt-1 tracking-tight">Podio</span>
        </button>

        {/* Tab: Panel Admin */}
        <button
          onClick={() => {
            if (isAdmin) {
              onChangeTab('admin');
            } else {
              onOpenAdminLogin();
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
            currentTab === 'admin'
              ? 'text-sky-700 font-bold bg-sky-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          style={{ minHeight: '48px' }}
        >
          {isAdmin ? (
            <UsersIcon size={20} className={currentTab === 'admin' ? 'text-sky-600' : ''} />
          ) : (
            <LockIcon size={20} />
          )}
          <span className="text-[10px] mt-1 tracking-tight">
            {isAdmin ? 'Admin' : 'Acceso'}
          </span>
        </button>
      </div>
    </div>
  );
};
