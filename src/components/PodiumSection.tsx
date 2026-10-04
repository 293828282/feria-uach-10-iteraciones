'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { StandEvaluationSummary, EvaluationCriteria } from '@/types/database';
import {
  AwardTrophyIcon,
  MedalSilverIcon,
  MedalBronzeIcon,
  ExportIcon,
  ChartBarIcon,
  AwardLaurelIcon,
  ConfettiSparkleIcon,
  RadarChartIcon,
  DownloadDocIcon,
} from '@/components/ui/vectors';
import { RippleButton } from '@/components/ui/RippleButton';
import { StandRadarChart } from '@/components/StandRadarChart';
import { firePodiumVictoryConfetti } from '@/lib/celebration';
import { exportRankingsToCSV } from '@/lib/exportCsv';
import { exportPodiumToWord } from '@/lib/exportWord';

function getStandImage(standNumber: string) {
  const clean = standNumber.replace(/\D/g, '').padStart(2, '0');
  const valid = ['01', '02', '03', '04', '05', '06'];
  return valid.includes(clean) ? `/stands/stand-${clean}.jpg` : '/stands/stand-01.jpg';
}

interface PodiumSectionProps {
  rankings: StandEvaluationSummary[];
  criteria: EvaluationCriteria[];
  totalEvaluationsCount: number;
  totalJudgesCount: number;
}

export const PodiumSection: React.FC<PodiumSectionProps> = ({
  rankings,
  criteria,
  totalEvaluationsCount,
  totalJudgesCount,
}) => {
  const [selectedRadarStandId, setSelectedRadarStandId] = useState<string | null>(null);
  const [isExportingWord, setIsExportingWord] = useState(false);

  const first = rankings[0];
  const second = rankings[1];
  const third = rankings[2];

  // Calculate global average
  const scoredStands = rankings.filter((r) => r.evaluationsCount > 0);
  const globalAverage =
    scoredStands.length > 0
      ? scoredStands.reduce((acc, curr) => acc + curr.weightedScore, 0) /
        scoredStands.length
      : 0;

  // Calculate cohort benchmark score per criteria
  const cohortScores = useMemo(() => {
    const map: Record<string, number> = {};
    if (scoredStands.length === 0) return map;

    criteria.forEach((c) => {
      let sum = 0;
      let count = 0;
      scoredStands.forEach((s) => {
        if (s.criteriaScores && s.criteriaScores[c.id]) {
          sum += s.criteriaScores[c.id];
          count += 1;
        }
      });
      map[c.id] = count > 0 ? sum / count : 4.0;
    });

    return map;
  }, [criteria, scoredStands]);

  // Econometric metrics for institutional analysis
  const { standardDeviation, medianScore, consensusRate, topCriterionName } = useMemo(() => {
    if (scoredStands.length === 0) {
      return {
        standardDeviation: 0,
        medianScore: 0,
        consensusRate: 100,
        topCriterionName: 'Ponderación general',
      };
    }

    const scores = scoredStands.map((s) => s.weightedScore).sort((a, b) => a - b);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length;
    const std = Math.sqrt(variance);

    const mid = Math.floor(scores.length / 2);
    const median = scores.length % 2 !== 0 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2;

    const consensus = mean > 0 ? Math.max(0, Math.min(100, (1 - std / mean) * 100)) : 100;

    let topCrit = { name: '', score: -1 };
    criteria.forEach((c) => {
      const avg = cohortScores[c.id];
      if (avg !== undefined && avg > topCrit.score) {
        topCrit = { name: c.question_text, score: avg };
      }
    });

    return {
      standardDeviation: std,
      medianScore: median,
      consensusRate: consensus,
      topCriterionName: topCrit.name || 'Ponderación general',
    };
  }, [scoredStands, criteria, cohortScores]);

  const handlePrint = () => {
    window.print();
  };

  const selectedStandSummary = rankings.find((r) => r.stand.id === selectedRadarStandId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Global KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="squircle-card p-5 border border-white/90">
          <span className="block text-[10px] uppercase font-mono text-slate-500 font-semibold mb-1">
            Votos / Notas Emitidas
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {totalEvaluationsCount}
          </span>
        </div>

        <div className="squircle-card p-5 border border-white/90">
          <span className="block text-[10px] uppercase font-mono text-slate-500 font-semibold mb-1">
            Promedio General Feria
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-sky-800 tabular-nums">
            {globalAverage > 0 ? globalAverage.toFixed(2) : '---'}
          </span>
        </div>

        <div className="squircle-card p-5 border border-white/90">
          <span className="block text-[10px] uppercase font-mono text-slate-500 font-semibold mb-1">
            Stands Calificados
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-800 tabular-nums">
            {scoredStands.length} / {rankings.length}
          </span>
        </div>

        <div className="squircle-card p-5 border border-white/90">
          <span className="block text-[10px] uppercase font-mono text-slate-500 font-semibold mb-1">
            Jueces Computados
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {totalJudgesCount}
          </span>
        </div>
      </div>

      {/* Econometric Analytics Ribbon */}
      <div className="squircle-card p-4 sm:p-5 border border-sky-100 bg-gradient-to-r from-sky-50/70 via-white/80 to-purple-50/70 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChartBarIcon size={18} className="text-sky-700 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 font-serif block">
                Monitor Econométrico & Consenso de Evaluación UACh &bull; Sede Puerto Montt
              </span>
              <span className="text-[11px] text-slate-500">
                Dispersión estadística y alineación metodológica del cuerpo de jurados
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/80">
              <span className="block text-[9.5px] uppercase font-mono text-slate-500">
                Dispersión (&sigma;)
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                &plusmn;{standardDeviation.toFixed(2)} pts
              </span>
            </div>

            <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/80">
              <span className="block text-[9.5px] uppercase font-mono text-slate-500">
                Mediana Ponderada
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {medianScore > 0 ? medianScore.toFixed(2) : '---'}
              </span>
            </div>

            <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/80">
              <span className="block text-[9.5px] uppercase font-mono text-slate-500">
                Consenso Inter-Juez
              </span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {consensusRate.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/80">
              <span className="block text-[9.5px] uppercase font-mono text-slate-500">
                Criterio Líder
              </span>
              <span className="font-semibold text-sky-900 text-xs truncate block" title={topCriterionName}>
                {topCriterionName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Winners Podium Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-serif">
            <AwardTrophyIcon className="text-amber-500" size={24} />
            <span>Podio Oficial de Emprendimiento UACh 2026 &bull; Sede Puerto Montt</span>
          </h2>
          <p className="text-xs text-slate-600">
            Determinación algorítmica de los mejores proyectos según la matriz de ponderación institucional
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <RippleButton
            onClick={async () => {
              if (isExportingWord) return;
              setIsExportingWord(true);
              try {
                await exportPodiumToWord(rankings, criteria, {
                  totalEvaluations: totalEvaluationsCount,
                  totalJudges: totalJudgesCount,
                  globalAverage,
                  consensusRate,
                  standardDeviation,
                });
              } catch (err) {
                console.error('Error al exportar Word:', err);
              } finally {
                setIsExportingWord(false);
              }
            }}
            disabled={isExportingWord}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300/80 shadow-xs"
          >
            <DownloadDocIcon size={15} />
            <span>{isExportingWord ? 'Generando Word con Fotos...' : 'Descargar Acta Word (con Fotos)'}</span>
          </RippleButton>

          <RippleButton
            onClick={() => exportRankingsToCSV(rankings)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-800"
          >
            <DownloadDocIcon size={15} />
            <span>Exportar CSV</span>
          </RippleButton>

          <RippleButton
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl"
          >
            <ExportIcon size={15} />
            <span>Imprimir Acta Oficial</span>
          </RippleButton>
        </div>
      </div>

      {/* 3D Visual Escalated Podium Architecture (1st Center elevated, 2nd Left, 3rd Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
        {/* 2nd Place (Silver - Left) */}
        <div className="order-2 md:order-1 squircle-card p-6 flex flex-col justify-between shadow-velvet relative border border-slate-300/80 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -top-3.5 left-6 rounded-full bg-slate-100 border border-slate-300 px-3.5 py-1 text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <MedalSilverIcon size={14} className="text-slate-600" />
            <span>2° Lugar &bull; Plata</span>
          </div>

          <div className="mt-4">
            {second ? (
              <>
                <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 border border-slate-200 bg-slate-100 shadow-sm">
                  <Image
                    src={second.stand.image_url || getStandImage(second.stand.stand_number)}
                    alt={second.stand.project_name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                </div>
                <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-mono text-slate-700 font-semibold mb-2 tabular-nums">
                  STAND #{second.stand.stand_number} &bull; {second.stand.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 font-serif">
                  {second.stand.project_name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {second.stand.team_members}
                </p>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">Sin datos suficientes</div>
            )}
          </div>

          <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between">
            <RippleButton
              onClick={() => setSelectedRadarStandId(selectedRadarStandId === second?.stand.id ? null : second?.stand.id || null)}
              className="text-[11px] px-2.5 py-1 rounded-lg"
            >
              <RadarChartIcon size={13} className="text-sky-700" />
              <span>Radar</span>
            </RippleButton>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block">Puntaje</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {second && second.evaluationsCount > 0 ? `${second.weightedScore.toFixed(2)}` : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* 1st Place (Gold Champion - Center Elevated with Crown & Aura) */}
        <div className="order-1 md:order-2 squircle-card p-7 flex flex-col justify-between shadow-velvet-lg relative md:-translate-y-5 border-2 border-amber-400 bg-gradient-to-b from-white/95 to-amber-50/40">
          {/* Champion Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 border border-amber-300 px-5 py-1 text-xs font-mono font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-400/40 animate-soft-float">
            <AwardLaurelIcon size={16} />
            <span>1° Lugar &bull; Campeón UACh</span>
          </div>

          <div className="mt-3">
            {first ? (
              <>
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 border-2 border-amber-300 shadow-md bg-amber-50">
                  <Image
                    src={first.stand.image_url || getStandImage(first.stand.stand_number)}
                    alt={first.stand.project_name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block rounded-md bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-900 tabular-nums">
                    STAND #{first.stand.stand_number} &bull; {first.stand.category}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    Gran Dictamen
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight font-serif">
                  {first.stand.project_name}
                </h3>
                <p className="text-xs text-slate-700 line-clamp-3 mb-4 leading-relaxed">
                  {first.stand.team_members}
                </p>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">Sin evaluaciones emitidas</div>
            )}
          </div>

          <div className="border-t border-amber-200 pt-4 flex items-center justify-between">
            <RippleButton
              onClick={() => setSelectedRadarStandId(selectedRadarStandId === first?.stand.id ? null : first?.stand.id || null)}
              className="text-[11px] px-3 py-1.5 rounded-lg border-amber-300"
            >
              <RadarChartIcon size={14} className="text-amber-800" />
              <span>Ver Radar</span>
            </RippleButton>

            <div className="text-right">
              <span className="block text-[10px] uppercase font-mono text-amber-800 font-bold">
                Puntaje Ponderado Final
              </span>
              <span className="text-3xl font-extrabold font-mono tabular-nums text-amber-800">
                {first && first.evaluationsCount > 0 ? `${first.weightedScore.toFixed(2)}` : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* 3rd Place (Bronze - Right) */}
        <div className="order-3 squircle-card p-6 flex flex-col justify-between shadow-velvet relative border border-amber-200/80 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -top-3.5 left-6 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-[11px] font-mono font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <MedalBronzeIcon size={14} className="text-amber-700" />
            <span>3° Lugar &bull; Bronce</span>
          </div>

          <div className="mt-4">
            {third ? (
              <>
                <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 border border-slate-200 bg-slate-100 shadow-sm">
                  <Image
                    src={third.stand.image_url || getStandImage(third.stand.stand_number)}
                    alt={third.stand.project_name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                </div>
                <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-mono text-slate-700 font-semibold mb-2 tabular-nums">
                  STAND #{third.stand.stand_number} &bull; {third.stand.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 font-serif">
                  {third.stand.project_name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {third.stand.team_members}
                </p>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">Sin datos suficientes</div>
            )}
          </div>

          <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between">
            <RippleButton
              onClick={() => setSelectedRadarStandId(selectedRadarStandId === third?.stand.id ? null : third?.stand.id || null)}
              className="text-[11px] px-2.5 py-1 rounded-lg"
            >
              <RadarChartIcon size={13} className="text-amber-800" />
              <span>Radar</span>
            </RippleButton>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block">Puntaje</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {third && third.evaluationsCount > 0 ? `${third.weightedScore.toFixed(2)}` : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Stand Radar Modal / Drawer */}
      {selectedStandSummary && (
        <div className="squircle-card p-6 border-2 border-sky-300 shadow-velvet-lg animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 mb-4">
            <div className="flex items-center gap-2">
              <RadarChartIcon size={18} className="text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                Desglose Radar: Stand #{selectedStandSummary.stand.stand_number} &bull; {selectedStandSummary.stand.project_name}
              </h3>
            </div>
            <RippleButton
              onClick={() => setSelectedRadarStandId(null)}
              className="text-xs px-3 py-1 rounded-lg"
            >
              Cerrar
            </RippleButton>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            <StandRadarChart
              criteria={criteria}
              scores={selectedStandSummary.criteriaScores}
              benchmarkScores={cohortScores}
              size={300}
            />

            <div className="space-y-2 max-w-sm w-full">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-serif">
                Puntajes Promedio por Criterio:
              </h4>
              {criteria.map((c) => {
                const avg = selectedStandSummary.criteriaScores[c.id] || 0;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/70 border border-slate-200"
                  >
                    <span className="text-slate-700 truncate pr-2">{c.question_text}</span>
                    <span className="font-mono font-bold text-sky-800 flex-shrink-0 tabular-nums">
                      {avg > 0 ? avg.toFixed(1) : '---'} / 7.0
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings Data Table (Desktop) & Cards (Mobile) */}
      <div className="squircle-card overflow-hidden border border-white/90 shadow-velvet">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBarIcon size={17} className="text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Tabla Completa de Clasificación y Dictamen
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {rankings.length} proyectos registrados
          </span>
        </div>

        {/* Mobile View (< 768px): Card Stack */}
        <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
          {rankings.map((summary, idx) => (
            <div key={summary.stand.id} className="p-3 bg-white/80 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 font-mono font-bold text-xs flex items-center justify-center text-slate-700">
                  {idx + 1}°
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-sky-700">#{summary.stand.stand_number}</span>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px] font-serif">{summary.stand.project_name}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">{summary.stand.category} &bull; {summary.evaluationsCount} votos</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {summary.evaluationsCount > 0 ? summary.weightedScore.toFixed(2) : '---'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (>= 768px): Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 border-b border-slate-200/80 text-[11px] font-mono uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Pos</th>
                <th className="py-3 px-4">Stand / Proyecto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Votos</th>
                <th className="py-3 px-4 text-center">Jurados</th>
                <th className="py-3 px-4 text-right">Nota Ponderada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {rankings.map((summary, idx) => (
                <tr key={summary.stand.id} className="hover:bg-white/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500 tabular-nums">
                    {idx === 0 && <span className="text-amber-500 font-extrabold">1°</span>}
                    {idx === 1 && <span className="text-slate-600 font-extrabold">2°</span>}
                    {idx === 2 && <span className="text-amber-700 font-extrabold">3°</span>}
                    {idx > 2 && `${idx + 1}°`}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sky-700 font-bold tabular-nums">
                        #{summary.stand.stand_number}
                      </span>
                      <span className="font-semibold text-slate-900 font-serif">
                        {summary.stand.project_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {summary.stand.category}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 tabular-nums">
                    {summary.evaluationsCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 tabular-nums">
                    {summary.judgesCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                    {summary.evaluationsCount > 0 ? summary.weightedScore.toFixed(2) : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
