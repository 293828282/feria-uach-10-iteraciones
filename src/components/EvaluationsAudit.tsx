'use client';

import React, { useState } from 'react';
import { Evaluation, Stand, Judge, EvaluationCriteria } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { TrashIcon, SearchIcon } from '@/components/ui/vectors';

interface EvaluationsAuditProps {
  evaluations: Evaluation[];
  stands: Stand[];
  judges: Judge[];
  criteria: EvaluationCriteria[];
  onRefresh: () => void;
}

export const EvaluationsAudit: React.FC<EvaluationsAuditProps> = ({
  evaluations,
  stands,
  judges,
  criteria,
  onRefresh,
}) => {
  const [filterJudge, setFilterJudge] = useState<string>('ALL');
  const [filterStand, setFilterStand] = useState<string>('ALL');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Maps for fast lookup
  const standsMap = new Map(stands.map((s) => [s.id, s]));
  const judgesMap = new Map(judges.map((j) => [j.id, j]));
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

  const filteredEvaluations = evaluations.filter((ev) => {
    const matchJudge = filterJudge === 'ALL' || ev.judge_id === filterJudge;
    const matchStand = filterStand === 'ALL' || ev.stand_id === filterStand;
    return matchJudge && matchStand;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de voto individual?')) return;
    setIsDeleting(id);
    try {
      const { error } = await supabase.from('evaluations').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar.';
      alert(msg);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/50 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Registro y Auditoría de Evaluaciones Individuales
          </h2>
          <p className="text-xs text-slate-600">
            Control de trazabilidad de cada voto y observación emitidos en tiempo real por el jurado.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterJudge}
            onChange={(e) => setFilterJudge(e.target.value)}
            className="rounded-xl glass-input px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-400 bg-white/70"
          >
            <option value="ALL">Todos los Jueces</option>
            {judges.map((j) => (
              <option key={j.id} value={j.id}>
                {j.full_name}
              </option>
            ))}
          </select>

          <select
            value={filterStand}
            onChange={(e) => setFilterStand(e.target.value)}
            className="rounded-xl glass-input px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-400 bg-white/70"
          >
            <option value="ALL">Todos los Stands</option>
            {stands.map((s) => (
              <option key={s.id} value={s.id}>
                Stand #{s.stand_number} - {s.project_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl glass-panel overflow-hidden border border-white/80 shadow-md">
        {filteredEvaluations.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No se registran votos que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-mono uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Fecha/Hora</th>
                <th className="py-3 px-4">Juez</th>
                <th className="py-3 px-4">Stand Evaluado</th>
                <th className="py-3 px-4">Criterio Calificado</th>
                <th className="py-3 px-4 text-center">Nota</th>
                <th className="py-3 px-4">Feedback</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredEvaluations.map((ev) => {
                const judge = judgesMap.get(ev.judge_id);
                const stand = standsMap.get(ev.stand_id);
                const crit = criteriaMap.get(ev.criteria_id);
                const time = new Date(ev.created_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={ev.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {time}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {judge?.full_name || 'Desconocido'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sky-700 font-bold mr-1">
                        #{stand?.stand_number}
                      </span>
                      <span className="text-slate-800 font-medium">{stand?.project_name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate">
                      {crit?.question_text || 'Criterio'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-mono font-bold text-sky-800">
                        {Number(ev.score).toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                      {ev.feedback || <span className="text-slate-400">Sin comentarios</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(ev.id)}
                        disabled={isDeleting === ev.id}
                        className="btn-light-gray p-1.5 rounded-lg inline-block text-slate-500 hover:text-red-600"
                        title="Eliminar este voto"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
