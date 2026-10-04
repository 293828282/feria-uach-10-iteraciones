'use client';

import React, { useState } from 'react';
import { Judge } from '@/types/database';
import { supabase } from '@/lib/supabase';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  SaveIcon,
  UsersIcon,
} from '@/components/ui/vectors';

interface JudgesManagementProps {
  judges: Judge[];
  onRefresh: () => void;
}

export const JudgesManagement: React.FC<JudgesManagementProps> = ({
  judges,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
  const [fullName, setFullName] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [judgeToDelete, setJudgeToDelete] = useState<Judge | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingJudge(null);
    setFullName('');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (judge: Judge) => {
    setEditingJudge(judge);
    setFullName(judge.full_name);
    setIsActive(judge.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('El nombre completo del juez es requerido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingJudge) {
        const { error } = await supabase
          .from('judges')
          .update({
            full_name: fullName.trim(),
            is_active: isActive,
          })
          .eq('id', editingJudge.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('judges').insert([
          {
            full_name: fullName.trim(),
            is_active: isActive,
          },
        ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el juez.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!judgeToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('judges')
        .delete()
        .eq('id', judgeToDelete.id);

      if (error) throw error;

      setJudgeToDelete(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar.';
      alert(`No se pudo eliminar el juez: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-sky-200/50 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Registro y Gestión del Jurado Evaluador
          </h2>
          <p className="text-xs text-slate-600">
            Administra los miembros del panel de jueces habilitados para calificar la feria.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-light-gray-active flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm"
        >
          <PlusIcon size={15} />
          <span>Registrar Juez</span>
        </button>
      </div>

      <div className="rounded-3xl glass-panel overflow-hidden border border-white/80 shadow-md">
        {/* Mobile View (< 768px): Card Stack */}
        <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
          {judges.map((judge) => (
            <div key={judge.id} className="p-3.5 bg-white/80 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-purple-100 border border-sky-200 flex items-center justify-center font-bold text-xs text-sky-800 font-mono shadow-sm flex-shrink-0">
                  {judge.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{judge.full_name}</h4>
                  <span className="text-[10px] text-slate-500 font-medium">Jurado Titular UACh</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openEditModal(judge)}
                  className="btn-light-gray min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-700"
                  title="Editar"
                >
                  <EditIcon size={16} />
                </button>
                <button
                  onClick={() => setJudgeToDelete(judge)}
                  className="btn-light-gray min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-red-600"
                  title="Eliminar"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (>= 768px): Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-mono uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Rol Institucional</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {judges.map((judge) => (
                <tr key={judge.id} className="hover:bg-white/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-purple-100 border border-sky-200 flex items-center justify-center font-bold text-xs text-sky-800 font-mono shadow-sm">
                        {judge.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {judge.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    Jurado Titular UACh 2026
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                        judge.is_active
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {judge.is_active ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(judge)}
                      className="btn-light-gray p-1.5 rounded-lg inline-block text-slate-600 hover:text-slate-900"
                      title="Editar Juez"
                    >
                      <EditIcon size={15} />
                    </button>
                    <button
                      onClick={() => setJudgeToDelete(judge)}
                      className="btn-light-gray p-1.5 rounded-lg inline-block text-slate-600 hover:text-red-600"
                      title="Eliminar Juez"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl glass-panel shadow-2xl overflow-hidden border border-white/80">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-white/70">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingJudge ? 'Editar Jurado' : 'Registrar Nuevo Jurado'}
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

              <div>
                <label htmlFor="judge-name" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Nombre Completo y Título
                </label>
                <input
                  id="judge-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Clemente Caro Mallol"
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="judge-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="judge-active" className="text-xs text-slate-700 font-medium">
                  Juez activo para emitir votos
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
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Juez'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {judgeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/80">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">
              ¿Eliminar Juez?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Se eliminará al juez &quot;{judgeToDelete.full_name}&quot; y todas sus calificaciones emitidas.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setJudgeToDelete(null)}
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
