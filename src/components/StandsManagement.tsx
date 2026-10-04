'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Stand } from '@/types/database';
import { supabase } from '@/lib/supabase';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  SaveIcon,
  UploadIcon,
  ImageIcon,
} from '@/components/ui/vectors';

interface StandsManagementProps {
  stands: Stand[];
  onRefresh: () => void;
}

export const StandsManagement: React.FC<StandsManagementProps> = ({
  stands,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<Stand | null>(null);

  // Form fields
  const [standNumber, setStandNumber] = useState('');
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete modal
  const [standToDelete, setStandToDelete] = useState<Stand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateModal = () => {
    setEditingStand(null);
    setStandNumber(`0${stands.length + 1}`);
    setProjectName('');
    setCategory('Innovación');
    setTeamMembers('');
    setIsActive(true);
    setImageUrl('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (stand: Stand) => {
    setEditingStand(stand);
    setStandNumber(stand.stand_number);
    setProjectName(stand.project_name);
    setCategory(stand.category || 'General');
    setTeamMembers(stand.team_members || '');
    setIsActive(stand.is_active);
    setImageUrl(stand.image_url || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Handle image file upload with client-side compression to Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('El archivo seleccionado debe ser una imagen válida (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setImageUrl(compressedDataUrl);
          setErrorMsg(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !standNumber.trim()) {
      setErrorMsg('El número de stand y el nombre del proyecto son requeridos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingStand) {
        // Update
        const { error } = await supabase
          .from('stands')
          .update({
            stand_number: standNumber.trim(),
            project_name: projectName.trim(),
            category: category.trim(),
            team_members: teamMembers.trim(),
            is_active: isActive,
            image_url: imageUrl.trim() || null,
          })
          .eq('id', editingStand.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('stands').insert([
          {
            stand_number: standNumber.trim(),
            project_name: projectName.trim(),
            category: category.trim(),
            team_members: teamMembers.trim(),
            is_active: isActive,
            image_url: imageUrl.trim() || null,
          },
        ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el stand.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!standToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('stands')
        .delete()
        .eq('id', standToDelete.id);

      if (error) throw error;

      setStandToDelete(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar.';
      alert(`No se pudo eliminar el stand: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Gestión de Stands e Imagen de Presentación
          </h2>
          <p className="text-xs text-slate-600">
            Administra los equipos participantes y adjunta sus fotografías o pósteres de presentación.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-light-gray flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold self-start sm:self-auto"
        >
          <PlusIcon size={15} />
          <span>Agregar Grupo / Stand</span>
        </button>
      </div>

      {/* Stands Table */}
      <div className="rounded-3xl glass-panel overflow-hidden border border-white/80 shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-600">
            <tr>
              <th className="py-3.5 px-4 w-28">Imagen</th>
              <th className="py-3.5 px-4 w-20">Stand</th>
              <th className="py-3.5 px-4">Proyecto</th>
              <th className="py-3.5 px-4">Categoría</th>
              <th className="py-3.5 px-4">Integrantes</th>
              <th className="py-3.5 px-4 text-center">Estado</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 text-slate-700">
            {stands.map((stand) => (
              <tr key={stand.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Thumbnail Preview */}
                <td className="py-3 px-4">
                  <div className="relative w-16 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {stand.image_url ? (
                      <Image
                        src={stand.image_url}
                        alt={stand.project_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono font-bold text-sky-800">
                  #{stand.stand_number}
                </td>

                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {stand.project_name}
                </td>

                <td className="py-3.5 px-4">
                  <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[11px] text-purple-700 font-semibold">
                    {stand.category || 'General'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                  {stand.team_members}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                      stand.is_active
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {stand.is_active ? 'Activo' : 'Pausado'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(stand)}
                    className="btn-light-gray p-1.5 rounded-lg inline-block text-slate-600 hover:text-slate-900"
                    title="Editar Stand e Imagen"
                  >
                    <EditIcon size={15} />
                  </button>
                  <button
                    onClick={() => setStandToDelete(stand)}
                    className="btn-light-gray p-1.5 rounded-lg inline-block text-slate-600 hover:text-red-600"
                    title="Eliminar Stand"
                  >
                    <TrashIcon size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal with Image Attachment Dropzone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/80 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-white/70 flex-shrink-0">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingStand ? 'Editar Stand e Imagen' : 'Nuevo Grupo / Stand Participante'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-light-gray p-1.5 rounded-lg text-slate-600 hover:text-slate-900"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto scrollbar-thin">
              {errorMsg && (
                <div className="rounded-xl border border-red-300 bg-red-50/80 px-3 py-2 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Image Attachment Dropzone */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Imagen de Presentación del Proyecto
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-sky-300/60 bg-slate-100 group shadow-md">
                    <div className="relative h-44 w-full">
                      <Image
                        src={imageUrl}
                        alt="Vista previa de presentación"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-light-gray px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-md"
                      >
                        Cambiar Imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="btn-light-gray px-3.5 py-1.5 text-xs font-semibold text-red-600 shadow-md"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl border-2 border-dashed border-sky-300 hover:border-purple-300 bg-white/60 hover:bg-white/80 p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 group-hover:scale-105 transition-transform shadow-inner">
                      <UploadIcon size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Haz clic o arrastra para adjuntar la imagen de presentación
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Formatos soportados: PNG, JPG o WEBP (máx. 5MB)
                      </span>
                    </div>
                  </div>
                )}

                {/* Optional Image URL Input */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="O bien pega aquí la URL web de la imagen..."
                    className="w-full rounded-xl glass-input px-3.5 py-1.5 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stand number & category */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label htmlFor="stand-num" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    N° Stand
                  </label>
                  <input
                    id="stand-num"
                    type="text"
                    value={standNumber}
                    onChange={(e) => setStandNumber(e.target.value)}
                    placeholder="01"
                    className="w-full rounded-xl glass-input px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="stand-cat" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Categoría
                  </label>
                  <input
                    id="stand-cat"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ej. Innovación Alimentaria"
                    className="w-full rounded-xl glass-input px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Project name */}
              <div>
                <label htmlFor="proj-name" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Nombre del Proyecto / Producto
                </label>
                <input
                  id="proj-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ej. Marisco en Polvo"
                  className="w-full rounded-xl glass-input px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Team members */}
              <div>
                <label htmlFor="proj-team" className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Integrantes del Equipo
                </label>
                <textarea
                  id="proj-team"
                  rows={2}
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="Nombres de los integrantes separados por coma..."
                  className="w-full rounded-xl glass-input px-3.5 py-2 text-xs text-slate-900 focus:outline-none resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="stand-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="stand-active" className="text-xs text-slate-700 font-medium">
                  Stand activo y visible para evaluación de los jueces
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
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Stand e Imagen'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {standToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/80">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">
              ¿Eliminar Stand #{standToDelete.stand_number}?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Se eliminará el stand &quot;{standToDelete.project_name}&quot; y todas las calificaciones asociadas emitidas por los jueces.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setStandToDelete(null)}
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
