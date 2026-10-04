'use client';

import React, { useState } from 'react';
import {
  Stand,
  Judge,
  EvaluationCriteria,
  Evaluation,
  StandEvaluationSummary,
} from '@/types/database';
import { PodiumSection } from './PodiumSection';
import { StandsManagement } from './StandsManagement';
import { JudgesManagement } from './JudgesManagement';
import { CriteriaManagement } from './CriteriaManagement';
import { EvaluationsAudit } from './EvaluationsAudit';
import {
  AwardTrophyIcon,
  ClipboardCheckIcon,
  UsersIcon,
  StarIcon,
  ChartBarIcon,
  RefreshIcon,
} from '@/components/ui/vectors';

interface AdminDashboardProps {
  stands: Stand[];
  judges: Judge[];
  criteria: EvaluationCriteria[];
  evaluations: Evaluation[];
  rankings: StandEvaluationSummary[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stands,
  judges,
  criteria,
  evaluations,
  rankings,
  onRefresh,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'podium' | 'stands' | 'judges' | 'criteria' | 'audit'>('podium');

  const tabs = [
    { id: 'podium', label: 'Podio y Ranking', icon: AwardTrophyIcon },
    { id: 'stands', label: 'Stands y Proyectos', icon: ClipboardCheckIcon },
    { id: 'judges', label: 'Panel de Jueces', icon: UsersIcon },
    { id: 'criteria', label: 'Pauta de Criterios', icon: StarIcon },
    { id: 'audit', label: 'Auditoría de Votos', icon: ChartBarIcon },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Subheader & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'btn-light-gray-active text-slate-900 font-bold'
                    : 'btn-light-gray text-slate-700'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="btn-light-gray flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshIcon size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'podium' && (
          <PodiumSection
            rankings={rankings}
            criteria={criteria}
            totalEvaluationsCount={evaluations.length}
            totalJudgesCount={judges.filter((j) => j.is_active).length}
          />
        )}

        {activeTab === 'stands' && (
          <StandsManagement stands={stands} onRefresh={onRefresh} />
        )}

        {activeTab === 'judges' && (
          <JudgesManagement judges={judges} onRefresh={onRefresh} />
        )}

        {activeTab === 'criteria' && (
          <CriteriaManagement criteria={criteria} onRefresh={onRefresh} />
        )}

        {activeTab === 'audit' && (
          <EvaluationsAudit
            evaluations={evaluations}
            stands={stands}
            judges={judges}
            criteria={criteria}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  );
};
