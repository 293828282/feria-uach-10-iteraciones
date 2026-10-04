'use client';

import React, { useState } from 'react';
import { EvaluationCriteria } from '@/types/database';
import { supabase } from '@/lib/supabase';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  SaveIcon,
  StarIcon,
} from '@/components/ui/vectors';

interface CriteriaManagementProps {
  criteria: EvaluationCriteria[];
  onRefresh: () => void;
}

export const CriteriaManagement: React.FC<CriteriaManagementProps> = ({
  criteria,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<EvaluationCriteria | null>(null);

  const [questionText, setQuestionText] = useState('');
  const [description, setDescription] = useState('');
  const [maxScore, setMaxScore] = useState(7);
  const [weight, setWeight] = useState(1.0);
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [criteriaToDelete, setCriteriaToDelete] = useState<EvaluationCriteria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingCriteria(null);
    setQuestionText('');
    setDescription('');
    setMaxScore(7);
    setWeight(1.0);
    setOrderIndex(criteria.length + 1);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (crit: EvaluationCriteria) => {
    setEditingCriteria(crit);
    setQuestionText(crit.question_text);
    setDescription(crit.description || '');
    setMaxScore(crit.max_score || 7);
    setWeight(Number(crit.weight) || 1.0);
    setOrderIndex(crit.order_index || 0);
    setIsActive(crit.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMsg('El enunciado del criterio o pregunta es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingCriteria) {
        const { error } = await supabase
          .from('evaluation_criteria')
          .update({
            order_index: Number(orderIndex),
            question_text: questionText.trim(),
            description: description.trim(),
            max_score: Number(maxScore),
            weight: Number(weight),
            is_active: isActive,
          })
          .eq('id', editingCriteria.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('evaluation_criteria').insert([
          {
            order_index: Number(orderIndex),
            question_text: questionText.trim(),
            description: description.trim(),
            max_score: Number(maxScore),
            weight: Number(weight),
            is_active: isActive,
          },
        ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el criterio.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!criteriaToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('evaluation_criteria')
        .delete()
        .eq('id', criteriaToDelete.id);

      if (error) throw error;

      setCriteriaToDelete(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar.';
      alert(`No se pudo eliminar el criterio: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-sky-200/50 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Pauta Dinámica de Criterios y Preguntas
          </h2>
          <p className="text-xs text-slate-600">
            Define y ajusta los ítems cuantitativos y ponderaciones de la matriz de evaluación.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-light-gray-active flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm"
        >
          <PlusIcon size={15} />
          <span>Nuevo Criterio</span>
        </button>
      </div>

      <div className="rounded-3xl glass-panel overflow-hidden border border-white/80 shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-mono uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4 w-14 text-center">N°</th>
              <th className="py-3 px-4">Criterio / Pregunta</th>
              <th className="py-3 px-4">Descripción Institucional</th>
              <th className="py-3 px-4 text-center">Escala</th>
              <th className="py-3 px-4 text-center">Ponderación</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {criteria.map((crit, index) => (
              <tr key={crit.id} className="hover:bg-white/60 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                  {crit.order_index || index + 1}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[220px]">
                  {crit.question_text}
                </td>
                <td className="py-3.5 px-4 text-slate-500 max-w-sm text-[11px] leading-relaxed line-clamp-2">
                  {crit.description}
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                  1 - {crit.max_score}
                </td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-700">
                  {Number(crit.weight || 1.0).toFixed(1)}x
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                      crit.is_active
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {crit.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(crit)}
                    className="btn-light-gray p-1.5 rounded-lg inline-block text-slate-600 hover:text-slate-900"
                    title="Editar Criterio"
                  >
                    <EditIcon size={15} />
                  </button>
                  <button
                    onClick={() => setCriteriaToDelete(crit)}
                    className="btn-light-gray p-1.5 rounded-lg inline-block text-slate-600 hover:text-red-600"
                    title="Eliminar Criterio"
                  >
                    <TrashIcon size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel shadow-2xl overflow-hidden border border-white/80">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-white/70">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingCriteria ? 'Editar Criterio' : 'Nuevo Criterio de Evaluación'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-light-gray p-1.5 rounded-lg text-slate-600 hover:text-slate-900"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-red-300 bg-red-50/80 px-3 py-2 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label htmlFor="crit-order" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Orden
                  </label>
                  <input
                    id="crit-order"
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full rounded-xl glass-input px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="crit-max" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Puntaje Máx
                  </label>
                  <input
                    id="crit-max"
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full rounded-xl glass-input px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="crit-weight" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Ponderación
                  </label>
                  <input
                    id="crit-weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full rounded-xl glass-input px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="crit-text" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Criterio / Pregunta
                </label>
                <input
                  id="crit-text"
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ej. Evaluación del Pitch"
                  className="w-full rounded-xl glass-input px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="crit-desc" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Descripción y Orientación al Evaluador
                </label>
                <textarea
                  id="crit-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué aspectos observables deben considerarse para otorgar el puntaje..."
                  className="w-full rounded-xl glass-input px-3.5 py-2 text-xs text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="crit-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="crit-active" className="text-xs text-slate-700 font-medium">
                  Criterio activo e incluido en la pauta de evaluación
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-light-gray px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-light-gray-active px-5 py-2 text-xs font-bold text-slate-900 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <SaveIcon size={15} />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Criterio'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {criteriaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/80">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">
              ¿Eliminar Criterio?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Se eliminará el criterio &quot;{criteriaToDelete.question_text}&quot; y todas las calificaciones registradas bajo esta pregunta.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setCriteriaToDelete(null)}
                disabled={isDeleting}
                className="btn-light-gray px-3.5 py-1.5 text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-light-gray px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border-red-200 disabled:opacity-50 flex items-center gap-1.5"
              >
                <TrashIcon size={14} />
                <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
