'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Stand, EvaluationCriteria, Evaluation, Judge } from '@/types/database';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeftIcon,
  SaveIcon,
  CheckIcon,
  SparklesIcon,
  RadarChartIcon,
  JudgeGavelIcon,
  TargetGoalIcon,
  StopwatchIcon,
  CloudCheckIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  EyeExpandIcon,
  QRIcon,
  QuotesIcon,
} from '@/components/ui/vectors';
import { StandRadarChart } from '@/components/StandRadarChart';
import { RippleButton } from '@/components/ui/RippleButton';
import { PitchTimer } from '@/components/PitchTimer';
import { StandImageLightbox } from '@/components/StandImageLightbox';
import { StandQRCodeModal } from '@/components/StandQRCodeModal';
import { fireEvaluationConfetti } from '@/lib/celebration';
import { soundFX } from '@/lib/soundFx';

interface StandEvaluationFormProps {
  stand: Stand;
  judge: Judge;
  criteria: EvaluationCriteria[];
  existingEvaluations: Evaluation[];
  allStands?: Stand[];
  cohortScores?: Record<string, number>;
  onSelectStand?: (stand: Stand) => void;
  onBack: () => void;
  onEvaluationSaved: () => void;
}

function getStandImage(standNumber: string) {
  const clean = standNumber.replace(/\D/g, '').padStart(2, '0');
  const valid = ['01', '02', '03', '04', '05', '06'];
  return valid.includes(clean) ? `/stands/stand-${clean}.jpg` : '/stands/stand-01.jpg';
}

export const StandEvaluationForm: React.FC<StandEvaluationFormProps> = ({
  stand,
  judge,
  criteria,
  existingEvaluations,
  allStands = [],
  cohortScores,
  onSelectStand,
  onBack,
  onEvaluationSaved,
}) => {
  const [scores, setScores] = useState<{ [criteriaId: string]: number }>({});
  const [generalFeedback, setGeneralFeedback] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);

  // Modals & Panels
  const [showRadar, setShowRadar] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  // Gemini AI Assistant State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiMode, setAiMode] = useState<'feedback' | 'defense_questions' | 'swot_brief'>('feedback');
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Storage key for local auto-drafting
  const draftStorageKey = useMemo(() => {
    return `uach_draft_${judge.id}_${stand.id}`;
  }, [judge.id, stand.id]);

  // Load existing evaluations or restore local draft
  useEffect(() => {
    if (existingEvaluations && existingEvaluations.length > 0) {
      const initialScores: { [key: string]: number } = {};
      let initialFeedback = '';

      existingEvaluations.forEach((ev) => {
        initialScores[ev.criteria_id] = Number(ev.score);
        if (ev.feedback && !initialFeedback) {
          initialFeedback = ev.feedback;
        }
      });

      setScores(initialScores);
      if (initialFeedback) {
        setGeneralFeedback(initialFeedback);
      }
    } else {
      // Check local storage draft
      try {
        const savedDraft = localStorage.getItem(draftStorageKey);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed.scores === 'object') {
            setScores(parsed.scores);
            if (parsed.feedback) setGeneralFeedback(parsed.feedback);
            setLastAutoSavedTime(new Date(parsed.updatedAt || Date.now()).toLocaleTimeString());
          }
        }
      } catch {}
    }
  }, [existingEvaluations, draftStorageKey]);

  // Autosave draft locally whenever scores or feedback change
  useEffect(() => {
    if (Object.keys(scores).length > 0 || generalFeedback) {
      const timer = setTimeout(() => {
        try {
          const draftPayload = {
            scores,
            feedback: generalFeedback,
            updatedAt: Date.now(),
          };
          localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
          setLastAutoSavedTime(new Date().toLocaleTimeString());
        } catch {}
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [scores, generalFeedback, draftStorageKey]);

  // Handle score change
  const handleScoreChange = (criteriaId: string, score: number) => {
    soundFX.triggerHaptic(25);
    setScores((prev) => ({
      ...prev,
      [criteriaId]: score,
    }));
  };

  // Progress metrics
  const answeredCount = Object.keys(scores).filter((id) => (scores[id] || 0) > 0).length;
  const totalCount = criteria.length;

  // Weighted average calculation
  const currentAverage = useMemo(() => {
    if (criteria.length === 0) return 0;
    let totalScore = 0;
    let totalWeight = 0;

    criteria.forEach((crit) => {
      const sc = scores[crit.id] || 0;
      const wt = Number(crit.weight) || 1.0;
      totalScore += sc * wt;
      totalWeight += wt;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }, [criteria, scores]);

  // Direct Stand Switcher Navigation (Previous / Next)
  const currentStandIndex = useMemo(() => {
    return allStands.findIndex((s) => s.id === stand.id);
  }, [allStands, stand.id]);

  const prevStand = currentStandIndex > 0 ? allStands[currentStandIndex - 1] : null;
  const nextStand = currentStandIndex >= 0 && currentStandIndex < allStands.length - 1 ? allStands[currentStandIndex + 1] : null;

  // Trigger Gemini AI Assistant
  const handleGenerateAIFeedback = async (selectedMode: 'feedback' | 'defense_questions' | 'swot_brief' = aiMode) => {
    if (answeredCount < 2) {
      setAiNotice('Califica al menos 2 criterios para que Gemini AI contextualice el dictamen.');
      setTimeout(() => setAiNotice(null), 3500);
      return;
    }

    setIsGeneratingAI(true);
    setAiNotice(null);
    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: stand.project_name,
          category: stand.category || 'General',
          teamMembers: stand.team_members || 'Equipo Emprendedor',
          scores,
          criteria,
          mode: selectedMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al conectar con el Asistente IA.');
      }

      setGeneralFeedback(data.feedback);
      setAiNotice('Propuesta académica generada exitosamente con Gemini IA.');
      setTimeout(() => setAiNotice(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al generar feedback.';
      setAiNotice(`Aviso IA: ${msg}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save evaluations to Supabase
  const handleSave = async () => {
    if (answeredCount < totalCount) {
      setErrorMsg(`Por favor califica todos los criterios (${answeredCount}/${totalCount} respondidos).`);
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = criteria.map((crit) => ({
        judge_id: judge.id,
        stand_id: stand.id,
        criteria_id: crit.id,
        score: scores[crit.id] || 0,
        feedback: generalFeedback.trim() || null,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('evaluations')
        .upsert(payload, { onConflict: 'judge_id,stand_id,criteria_id' });

      if (error) throw error;

      // Clean local storage draft upon verified submission
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {}

      // Play victory chime, haptics & confetti
      soundFX.playScoreSubmitted();
      soundFX.triggerHaptic([50, 50, 120, 60]);
      fireEvaluationConfetti();

      setSaveSuccess(true);
      setTimeout(() => {
        onEvaluationSaved();
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la evaluación.';
      setErrorMsg(`Error de sincronización con Supabase: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const standImg = stand.image_url || getStandImage(stand.stand_number);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 animate-fade-in">
      {/* Top Bar with Back, Fast Stand Switcher & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/60 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <RippleButton
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl"
          >
            <ChevronLeftIcon size={18} />
            <span className="hidden sm:inline">Volver al catálogo</span>
            <span className="sm:hidden">Catálogo</span>
          </RippleButton>

          {/* Quick Stand Jump Controls */}
          {allStands.length > 1 && onSelectStand && (
            <div className="flex items-center gap-1 bg-white/70 rounded-xl p-1 border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => prevStand && onSelectStand(prevStand)}
                disabled={!prevStand}
                title={prevStand ? `Ir a Stand #${prevStand.stand_number}` : 'Primer Stand'}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeftCircleIcon size={18} />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-700 px-1.5">
                {currentStandIndex + 1}/{allStands.length}
              </span>
              <button
                type="button"
                onClick={() => nextStand && onSelectStand(nextStand)}
                disabled={!nextStand}
                title={nextStand ? `Ir a Stand #${nextStand.stand_number}` : 'Último Stand'}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRightCircleIcon size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Tool Buttons (Timer & Radar) */}
        <div className="flex items-center gap-2 flex-wrap">
          <RippleButton
            onClick={() => setShowTimer(!showTimer)}
            isActive={showTimer}
            className="px-3 py-2 text-xs font-semibold rounded-xl"
          >
            <StopwatchIcon size={15} className="text-sky-700" />
            <span>{showTimer ? 'Cerrar Cronómetro' : 'Cronómetro Pitch'}</span>
          </RippleButton>

          <RippleButton
            onClick={() => setShowRadar(!showRadar)}
            isActive={showRadar}
            className="px-3 py-2 text-xs font-semibold rounded-xl"
          >
            <RadarChartIcon size={15} className="text-sky-700" />
            <span>{showRadar ? 'Ocultar Radar' : 'Matriz Radar'}</span>
          </RippleButton>

          <div className="rounded-2xl glass-panel px-3 py-1.5 text-right border border-white/90 shadow-sm">
            <span className="block text-[9.5px] uppercase font-mono text-sky-800 font-semibold">
              Ponderado
            </span>
            <span className="block text-lg font-bold font-mono tabular-nums text-slate-900">
              {currentAverage.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Pitch & Defense Stopwatch Module (Collapsible) */}
      {showTimer && (
        <div className="animate-fade-in">
          <PitchTimer standName={`Stand #${stand.stand_number}: ${stand.project_name}`} />
        </div>
      )}

      {/* Stand Hero Card with Presentation Image & Actions */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/90 shadow-velvet">
        <div className="relative h-60 sm:h-80 w-full bg-slate-100">
          <Image
            src={standImg}
            alt={stand.project_name}
            fill
            className="object-cover"
            priority
          />
          {/* Luminous overlay for crystal-clear readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />

          {/* Floating Actions on Hero Banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200/80 shadow-sm backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Expandir lámina de presentación"
            >
              <EyeExpandIcon size={16} />
              <span className="hidden sm:inline">Ver Lámina</span>
            </button>
            <button
              onClick={() => setIsQROpen(true)}
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200/80 shadow-sm backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Código QR del Stand"
            >
              <QRIcon size={16} />
              <span className="hidden sm:inline">QR Móvil</span>
            </button>
          </div>
        </div>

        <div className="relative p-6 sm:p-8 -mt-24 z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="rounded-full bg-white/95 border border-sky-300 px-3 py-1 text-xs font-mono font-bold text-sky-800 backdrop-blur-md shadow-sm tabular-nums">
              STAND #{stand.stand_number}
            </span>
            <span className="rounded-full bg-purple-100/95 border border-purple-300 px-3 py-1 text-xs font-semibold text-purple-800 backdrop-blur-md shadow-sm">
              {stand.category || 'General'}
            </span>
            {lastAutoSavedTime && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                <CloudCheckIcon size={13} className="text-emerald-600" />
                <span>Borrador guardado {lastAutoSavedTime}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2 font-serif">
            {stand.project_name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
            <strong className="text-slate-900">Equipo Emprendedor:</strong> {stand.team_members}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span>Jurado activo: <strong className="text-slate-900">{judge.full_name}</strong></span>
            <span className="font-mono text-[11px]">Escala oficial: 1.0 (Deficiente) a 7.0 (Sobresaliente)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Radar Chart Section (Collapsible with cohort benchmark) */}
      {showRadar && (
        <div className="squircle-card p-6 border border-white/90 shadow-velvet flex flex-col items-center justify-center animate-fade-in">
          <div className="flex items-center gap-2 mb-2 text-slate-800">
            <RadarChartIcon size={18} className="text-sky-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-serif">
              Matriz Radar Multidimensional del Proyecto
            </h3>
          </div>
          <p className="text-xs text-slate-600 text-center mb-4 max-w-md">
            Comparativa directa entre la evaluación actual del jurado y el promedio general de la cohorte.
          </p>

          <StandRadarChart
            criteria={criteria}
            scores={scores}
            benchmarkScores={cohortScores}
            size={340}
          />
        </div>
      )}

      {/* Error or Success notification */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-xs text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-2xl border border-sky-300 bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckIcon size={18} className="text-sky-700" />
          <span>¡Evaluación registrada exitosamente con firma del jurado! Sincronizando podio...</span>
        </div>
      )}

      {/* Criteria Question Cards with Ripple 1-to-7 Selectors */}
      <div className="space-y-4">
        {criteria.map((crit, index) => {
          const selectedScore = scores[crit.id] || 0;
          const maxScore = crit.max_score || 7;
          const scaleNumbers = Array.from({ length: maxScore }, (_, i) => i + 1);

          return (
            <div
              key={crit.id}
              className={`rounded-3xl p-5 sm:p-6 transition-all ${
                selectedScore > 0
                  ? 'squircle-card border-purple-300/80 shadow-md'
                  : 'glass-card hover:border-sky-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-300 text-sky-800 font-mono text-xs flex items-center justify-center font-bold shadow-sm tabular-nums">
                    {index + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    {crit.question_text}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="rounded-lg bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-mono text-slate-600 font-semibold tabular-nums">
                    Pond: {Number(crit.weight || 1.0).toFixed(1)}x
                  </span>
                  {selectedScore > 0 && (
                    <span className="rounded-lg bg-purple-100 border border-purple-300 px-2.5 py-0.5 text-xs font-mono font-bold text-purple-800 shadow-sm tabular-nums">
                      Nota: {selectedScore.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {crit.description && (
                <p className="text-xs text-slate-600 leading-relaxed mb-4 pl-10 italic">
                  {crit.description}
                </p>
              )}

              {/* Fast Touch Ripple Selector (1 to 7) */}
              <div className="pl-0 sm:pl-10 pt-1">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 max-w-md">
                  {scaleNumbers.map((num) => {
                    const isNumSelected = selectedScore === num;
                    return (
                      <RippleButton
                        key={num}
                        type="button"
                        onClick={() => handleScoreChange(crit.id, num)}
                        isActive={isNumSelected}
                        className={`h-12 sm:h-11 rounded-xl font-mono text-sm sm:text-base font-bold transition-all tabular-nums ${
                          isNumSelected ? 'text-base sm:text-lg scale-105 shadow-md' : ''
                        }`}
                      >
                        {num}
                      </RippleButton>
                    );
                  })}
                </div>
                <div className="flex justify-between max-w-md mt-2 px-1 text-[10px] text-slate-500 font-mono">
                  <span>1.0 Deficiente</span>
                  <span>4.0 Aceptable</span>
                  <span>7.0 Sobresaliente</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Qualitative Feedback Card with Gemini AI Multi-Mode Integration */}
      <div className="squircle-card p-6 sm:p-7 space-y-4 border border-white/90 shadow-velvet">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label htmlFor="eval-feedback" className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <QuotesIcon size={14} className="text-sky-700" />
              <span>Devolución Cualitativa y Asistente Académico IA</span>
            </label>
            <p className="text-[11px] text-slate-600">
              Comentarios formales para el acta de evaluación y dictamen oficial de la UACh.
            </p>
          </div>

          {/* AI Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setAiMode('feedback');
                handleGenerateAIFeedback('feedback');
              }}
              disabled={isGeneratingAI}
              className={`text-[11px] px-3 py-1.5 rounded-xl font-medium transition-all ${
                aiMode === 'feedback' ? 'btn-light-gray-active' : 'btn-light-gray'
              }`}
            >
              Dictamen
            </button>
            <button
              type="button"
              onClick={() => {
                setAiMode('defense_questions');
                handleGenerateAIFeedback('defense_questions');
              }}
              disabled={isGeneratingAI}
              className={`text-[11px] px-3 py-1.5 rounded-xl font-medium transition-all ${
                aiMode === 'defense_questions' ? 'btn-light-gray-active' : 'btn-light-gray'
              }`}
            >
              Preguntas Defensa
            </button>
            <button
              type="button"
              onClick={() => {
                setAiMode('swot_brief');
                handleGenerateAIFeedback('swot_brief');
              }}
              disabled={isGeneratingAI}
              className={`text-[11px] px-3 py-1.5 rounded-xl font-medium transition-all ${
                aiMode === 'swot_brief' ? 'btn-light-gray-active' : 'btn-light-gray'
              }`}
            >
              FODA Breve
            </button>
          </div>
        </div>

        {aiNotice && (
          <div className="rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs text-sky-800 font-medium animate-fade-in">
            {aiNotice}
          </div>
        )}

        <div className="relative">
          <textarea
            id="eval-feedback"
            rows={5}
            value={generalFeedback}
            onChange={(e) => setGeneralFeedback(e.target.value)}
            placeholder="Escribe aquí las observaciones o pulsa uno de los modos del Asistente IA para generar una propuesta académica estructurada..."
            className="w-full rounded-2xl glass-input px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed font-sans"
          />
          {isGeneratingAI && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-800">
              <SparklesIcon size={18} className="animate-spin text-purple-600" />
              <span>Sintetizando con Gemini 2.5 Flash IA...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar with Ripple Buttons */}
      <div className="sticky bottom-4 z-30 squircle-card p-4 flex items-center justify-between shadow-velvet-lg border border-white/95">
        <div>
          <span className="block text-[11px] font-mono text-slate-500">
            Promedio: <strong className="text-slate-900 font-bold font-mono text-base tabular-nums">{currentAverage.toFixed(2)}</strong>
          </span>
          <span className="text-[10px] text-slate-500 tabular-nums">
            {answeredCount === totalCount
              ? 'Todos los criterios calificados'
              : `Faltan ${totalCount - answeredCount} criterios por responder`}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <RippleButton
            type="button"
            onClick={onBack}
            className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold"
          >
            Cancelar
          </RippleButton>

          <RippleButton
            type="button"
            onClick={handleSave}
            disabled={isSaving || answeredCount < totalCount}
            isActive={true}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <SaveIcon size={16} />
            <span>{isSaving ? 'Guardando...' : 'Registrar Evaluación'}</span>
          </RippleButton>
        </div>
      </div>

      {/* Modals */}
      <StandImageLightbox
        isOpen={isLightboxOpen}
        imageUrl={standImg}
        standName={stand.project_name}
        category={stand.category}
        onClose={() => setIsLightboxOpen(false)}
      />

      <StandQRCodeModal
        isOpen={isQROpen}
        standId={stand.id}
        standNumber={Number(stand.stand_number)}
        standName={stand.project_name}
        onClose={() => setIsQROpen(false)}
      />
    </div>
  );
};
