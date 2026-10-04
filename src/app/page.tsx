'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Stand,
  Judge,
  EvaluationCriteria,
  Evaluation,
  StandEvaluationSummary,
} from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { TiltStandCard } from '@/components/TiltStandCard';
import { StandEvaluationForm } from '@/components/StandEvaluationForm';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PodiumSection } from '@/components/PodiumSection';
import { JudgeSelectorModal } from '@/components/JudgeSelectorModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { WelcomeJudgeGate } from '@/components/WelcomeJudgeGate';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { StandImageLightbox } from '@/components/StandImageLightbox';
import { StandQRCodeModal } from '@/components/StandQRCodeModal';
import { StandDetailSheet } from '@/components/StandDetailSheet';
import {
  SearchIcon,
  FilterIcon,
  CloseIcon,
  UniversityShieldIcon,
  CheckIcon,
} from '@/components/ui/vectors';
import { RippleButton } from '@/components/ui/RippleButton';

function getStandImage(standNumber: string) {
  const clean = standNumber.replace(/\D/g, '').padStart(2, '0');
  const valid = ['01', '02', '03', '04', '05', '06'];
  return valid.includes(clean) ? `/stands/stand-${clean}.jpg` : '/stands/stand-01.jpg';
}

export default function Home() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Context
  const [currentJudge, setCurrentJudge] = useState<Judge | null>(null);
  const [activeView, setActiveView] = useState<'judge' | 'podium' | 'admin'>('judge');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Stand being evaluated
  const [evaluatingStand, setEvaluatingStand] = useState<Stand | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Stand Image Lightbox & QR Modals
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    name: string;
    category: string;
  }>({
    isOpen: false,
    imageUrl: '',
    name: '',
    category: '',
  });
  const [qrModalStand, setQrModalStand] = useState<Stand | null>(null);
  const [detailSheetStand, setDetailSheetStand] = useState<Stand | null>(null);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load all data from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [standsRes, judgesRes, criteriaRes, evaluationsRes] = await Promise.all([
        supabase.from('stands').select('*').order('stand_number', { ascending: true }),
        supabase.from('judges').select('*').order('full_name', { ascending: true }),
        supabase.from('evaluation_criteria').select('*').order('order_index', { ascending: true }),
        supabase.from('evaluations').select('*'),
      ]);

      if (standsRes.error) throw standsRes.error;
      if (judgesRes.error) throw judgesRes.error;
      if (criteriaRes.error) throw criteriaRes.error;
      if (evaluationsRes.error) throw evaluationsRes.error;

      setStands(standsRes.data || []);
      setJudges(judgesRes.data || []);
      setCriteria(criteriaRes.data || []);
      setEvaluations(evaluationsRes.data || []);

      // Check if judge was previously chosen in current browser session
      if (typeof window !== 'undefined') {
        const storedJudgeId = localStorage.getItem('uach_judge_id_2026');
        if (storedJudgeId && judgesRes.data) {
          const matched = judgesRes.data.find((j: Judge) => j.id === storedJudgeId);
          if (matched) {
            setCurrentJudge(matched);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con Supabase.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle select judge
  const handleSelectJudge = (judge: Judge) => {
    setCurrentJudge(judge);
    setActiveView('judge');
    if (typeof window !== 'undefined') {
      localStorage.setItem('uach_judge_id_2026', judge.id);
    }
  };

  const handleClearJudge = () => {
    setCurrentJudge(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('uach_judge_id_2026');
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    stands.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['Todas', ...Array.from(set)];
  }, [stands]);

  const activeStands = useMemo(() => stands.filter((s) => s.is_active), [stands]);

  // Evaluations by current judge
  const judgeEvaluationsMap = useMemo(() => {
    const map = new Map<string, Evaluation[]>();
    if (!currentJudge) return map;

    evaluations.forEach((ev) => {
      if (ev.judge_id === currentJudge.id) {
        const list = map.get(ev.stand_id) || [];
        list.push(ev);
        map.set(ev.stand_id, list);
      }
    });
    return map;
  }, [evaluations, currentJudge]);

  const judgeCompletedCount = useMemo(() => {
    let count = 0;
    activeStands.forEach((stand) => {
      const evs = judgeEvaluationsMap.get(stand.id);
      if (evs && evs.length >= criteria.length && criteria.length > 0) {
        count += 1;
      }
    });
    return count;
  }, [activeStands, judgeEvaluationsMap, criteria.length]);

  // Cohort benchmark averages per criteria
  const cohortScores = useMemo(() => {
    const map: Record<string, number> = {};
    criteria.forEach((c) => {
      let sum = 0;
      let count = 0;
      evaluations.forEach((ev) => {
        if (ev.criteria_id === c.id) {
          sum += Number(ev.score);
          count += 1;
        }
      });
      map[c.id] = count > 0 ? sum / count : 4.0;
    });
    return map;
  }, [criteria, evaluations]);

  // Filtered stands (Search + Status) - Sin filtro limitante de categorías
  const filteredStands = useMemo(() => {
    return activeStands.filter((s) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        s.project_name.toLowerCase().includes(query) ||
        s.stand_number.toLowerCase().includes(query) ||
        (s.team_members && s.team_members.toLowerCase().includes(query));

      const standEvals = judgeEvaluationsMap.get(s.id) || [];
      const isCompleted = standEvals.length >= criteria.length && criteria.length > 0;

      let matchesStatus = true;
      if (selectedStatus === 'pending') {
        matchesStatus = !isCompleted;
      } else if (selectedStatus === 'completed') {
        matchesStatus = isCompleted;
      }

      return matchesSearch && matchesStatus;
    });
  }, [activeStands, searchQuery, selectedStatus, judgeEvaluationsMap, criteria.length]);

  // Stand rankings for Admin & Podium
  const standRankings: StandEvaluationSummary[] = useMemo(() => {
    return activeStands.map((stand) => {
      const standEvals = evaluations.filter((ev) => ev.stand_id === stand.id);
      const uniqueJudges = new Set(standEvals.map((e) => e.judge_id));
      const feedbacks: string[] = [];
      const criteriaScoresMap: { [criteriaId: string]: number } = {};

      criteria.forEach((crit) => {
        const critEvals = standEvals.filter((e) => e.criteria_id === crit.id);
        if (critEvals.length > 0) {
          const sum = critEvals.reduce((acc, curr) => acc + Number(curr.score), 0);
          criteriaScoresMap[crit.id] = sum / critEvals.length;
        }
      });

      let totalWeightedScore = 0;
      let totalWeight = 0;
      let rawScoreSum = 0;
      let rawCount = 0;

      criteria.forEach((crit) => {
        const avg = criteriaScoresMap[crit.id];
        if (avg !== undefined) {
          const w = Number(crit.weight) || 1.0;
          totalWeightedScore += avg * w;
          totalWeight += w;
          rawScoreSum += avg;
          rawCount += 1;
        }
      });

      standEvals.forEach((ev) => {
        if (ev.feedback && !feedbacks.includes(ev.feedback)) {
          feedbacks.push(ev.feedback);
        }
      });

      const weightedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const rawAverage = rawCount > 0 ? rawScoreSum / rawCount : 0;

      return {
        stand,
        evaluationsCount: standEvals.length,
        judgesCount: uniqueJudges.size,
        weightedScore,
        rawAverage,
        criteriaScores: criteriaScoresMap,
        feedbacks,
      };
    }).sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) {
        return b.weightedScore - a.weightedScore;
      }
      return b.judgesCount - a.judgesCount;
    });
  }, [activeStands, evaluations, criteria]);

  // 1. Initial Gate: If no judge is selected and not in admin view, show the "¿Qué juez eres tú?" gate!
  if (!currentJudge && activeView !== 'admin' && !isLoading) {
    return (
      <WelcomeJudgeGate
        judges={judges}
        onSelectJudge={handleSelectJudge}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onRefreshJudges={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen text-slate-800 flex flex-col justify-between pb-20 md:pb-0">
      {/* Top Institutional Navbar */}
      <Navbar
        currentJudge={currentJudge}
        onOpenJudgeSelector={() => setIsJudgeModalOpen(true)}
        onClearJudge={handleClearJudge}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          setActiveView('judge');
        }}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area (Optimizado para teléfonos con espacio inferior para MobileBottomNav) */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-36 sm:pb-16 flex-1 w-full">
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-50 px-4 py-3 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* VIEW 1: JUDGE ENVIRONMENT & STAND CATALOG */}
        {activeView === 'judge' && (
          <div>
            {evaluatingStand && currentJudge ? (
              <StandEvaluationForm
                stand={evaluatingStand}
                judge={currentJudge}
                criteria={criteria.filter((c) => c.is_active)}
                existingEvaluations={judgeEvaluationsMap.get(evaluatingStand.id) || []}
                allStands={activeStands}
                cohortScores={cohortScores}
                onSelectStand={(st) => setEvaluatingStand(st)}
                onBack={() => setEvaluatingStand(null)}
                onEvaluationSaved={() => {
                  setEvaluatingStand(null);
                  loadData();
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Active Judge Status Card */}
                {currentJudge && (
                  <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center font-bold font-mono text-sky-800 text-sm flex-shrink-0 shadow-sm">
                        {currentJudge.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 font-serif">
                            {currentJudge.full_name}
                          </span>
                          <span className="rounded-full bg-sky-100 border border-sky-300 px-2.5 py-0.5 text-[10px] font-mono text-sky-800 font-semibold">
                            Jurado Oficial
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Selecciona un stand del catálogo para ingresar la evaluación.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-[10px] font-mono uppercase text-slate-500">
                          Tu Progreso
                        </span>
                        <span className="block text-base font-bold font-mono tabular-nums text-slate-900">
                          {judgeCompletedCount} de {activeStands.length} Stands
                        </span>
                      </div>

                      <RippleButton
                        onClick={handleClearJudge}
                        className="rounded-xl px-3.5 py-2 text-xs font-semibold"
                      >
                        Cambiar Juez
                      </RippleButton>
                    </div>
                  </div>
                )}

                {/* Search Bar & Status Filter Tabs (Diseño adaptable a teléfono y escritorio) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sky-600">
                      <SearchIcon size={16} />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por stand, proyecto o autor (Presiona '/' para buscar)..."
                      className="w-full rounded-2xl glass-input pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <CloseIcon size={16} />
                      </button>
                    )}
                  </div>

                  {/* Status Filter Tabs (Grid adaptada a celulares) */}
                  <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-slate-200/80 shadow-xs">
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl font-semibold transition-all text-center ${
                        selectedStatus === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Todos ({activeStands.length})
                    </button>
                    <button
                      onClick={() => setSelectedStatus('pending')}
                      className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl font-semibold transition-all text-center ${
                        selectedStatus === 'pending'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pendientes ({activeStands.length - judgeCompletedCount})
                    </button>
                    <button
                      onClick={() => setSelectedStatus('completed')}
                      className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl font-semibold transition-all text-center ${
                        selectedStatus === 'completed'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Listos ({judgeCompletedCount})
                    </button>
                  </div>
                </div>

                {/* Stands Cards Grid with Interactive 3D Parallax Tilt */}
                {filteredStands.length === 0 ? (
                  <div className="py-16 text-center squircle-card p-8 border border-white/80">
                    <h3 className="text-base font-bold text-slate-800 font-serif">
                      No se encontraron stands con los filtros aplicados
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Intenta buscar con otros términos o seleccionar otra categoría.
                    </p>
                    <RippleButton
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Todas');
                        setSelectedStatus('all');
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl"
                    >
                      Restablecer Filtros
                    </RippleButton>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStands.map((stand) => {
                      const standEvals = judgeEvaluationsMap.get(stand.id) || [];
                      const isEvaluated =
                        standEvals.length >= criteria.length && criteria.length > 0;

                      let judgeAvg = 0;
                      if (standEvals.length > 0) {
                        const total = standEvals.reduce((acc, curr) => acc + Number(curr.score), 0);
                        judgeAvg = total / standEvals.length;
                      }

                      const standImg = stand.image_url || getStandImage(stand.stand_number);

                      return (
                        <TiltStandCard
                          key={stand.id}
                          stand={stand}
                          criteria={criteria}
                          standEvaluations={standEvals}
                          standImg={standImg}
                          isEvaluated={isEvaluated}
                          judgeAvg={judgeAvg}
                          onEvaluate={() => {
                            if (!currentJudge) {
                              setIsJudgeModalOpen(true);
                            } else {
                              setEvaluatingStand(stand);
                            }
                          }}
                          onOpenImage={(img, name, cat) =>
                            setLightboxData({
                              isOpen: true,
                              imageUrl: img,
                              name,
                              category: cat,
                            })
                          }
                          onOpenQR={(st) => setQrModalStand(st)}
                          onOpenSheet={() => setDetailSheetStand(stand)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PODIUM & OFFICIAL LEADERBOARD DIRECT ACCESS */}
        {activeView === 'podium' && (
          <div>
            <PodiumSection
              rankings={standRankings}
              criteria={criteria}
              totalEvaluationsCount={evaluations.length}
              totalJudgesCount={judges.filter((j) => j.is_active).length}
            />
          </div>
        )}

        {/* VIEW 3: ADMIN PANEL DASHBOARD */}
        {activeView === 'admin' && (
          <div>
            {isAdmin ? (
              <AdminDashboard
                stands={stands}
                judges={judges}
                criteria={criteria}
                evaluations={evaluations}
                rankings={standRankings}
                onRefresh={loadData}
                isLoading={isLoading}
              />
            ) : (
              <div className="max-w-md mx-auto py-16 text-center">
                <div className="glass-panel rounded-3xl p-8 shadow-xl border border-white/80">
                  <h2 className="text-base font-bold text-slate-900 mb-2 font-serif">
                    Acceso Administrativo Restringido
                  </h2>
                  <p className="text-xs text-slate-600 mb-6">
                    El Panel de Control y la Gestión Oficial requieren autenticación del comité evaluador de la UACh.
                  </p>
                  <RippleButton
                    onClick={() => setIsAdminModalOpen(true)}
                    isActive={true}
                    className="rounded-xl px-5 py-2.5 text-xs font-bold"
                  >
                    Ingresar Clave de Acceso
                  </RippleButton>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Institucional Oficial UACh (Sin texto ajeno a la institución) */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 text-center text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UniversityShieldIcon size={18} className="text-sky-700" />
            <span className="font-semibold text-slate-900 font-serif">
              Universidad Austral de Chile &bull; Feria de Emprendimiento 2026
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-serif">
            Facultad de Ciencias Económicas y Administrativas &bull; Escuela de Graduados &bull; Sede Puerto Montt, Región de Los Lagos
          </span>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation (Visible exclusively on mobile phones) */}
      <MobileBottomNav
        currentTab={activeView}
        onChangeTab={(tab) => {
          setActiveView(tab);
          setEvaluatingStand(null);
        }}
        selectedStandId={evaluatingStand?.id || null}
        onOpenEvaluation={() => {
          if (evaluatingStand) return;
          if (activeStands.length > 0) {
            setEvaluatingStand(activeStands[0]);
          }
        }}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        currentJudgeName={currentJudge?.full_name}
      />

      {/* Global Modals */}
      <JudgeSelectorModal
        isOpen={isJudgeModalOpen}
        judges={judges}
        currentJudge={currentJudge}
        onSelectJudge={handleSelectJudge}
        onClose={() => setIsJudgeModalOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setActiveView('admin');
        }}
      />

      <StandImageLightbox
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.imageUrl}
        standName={lightboxData.name}
        category={lightboxData.category}
        onClose={() =>
          setLightboxData((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {qrModalStand && (
        <StandQRCodeModal
          isOpen={true}
          standId={qrModalStand.id}
          standNumber={Number(qrModalStand.stand_number)}
          standName={qrModalStand.project_name}
          onClose={() => setQrModalStand(null)}
        />
      )}

      {/* Stand Technical Detail Sheet */}
      <StandDetailSheet
        isOpen={!!detailSheetStand}
        stand={detailSheetStand}
        criteria={criteria}
        evaluations={evaluations.filter((ev) => ev.stand_id === detailSheetStand?.id)}
        onClose={() => setDetailSheetStand(null)}
        onStartEvaluation={(st) => {
          setDetailSheetStand(null);
          if (!currentJudge) {
            setIsJudgeModalOpen(true);
          } else {
            setEvaluatingStand(st);
          }
        }}
        onOpenImage={(img, name, cat) =>
          setLightboxData({
            isOpen: true,
            imageUrl: img,
            name,
            category: cat,
          })
        }
        onOpenQR={(st) => setQrModalStand(st)}
      />
    </div>
  );
}
