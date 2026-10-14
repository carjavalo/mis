import { useEffect, useMemo, useState } from 'react';
import { FileStack, Pencil, Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { DocumentTemplate } from '@/components/forms-module/types/types';
import { templateService } from '@/lib/templateService';
import { useToast } from '@/providers/ToastContext';
import TemplateModal from './TemplateModal';

const PlantillasTable: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setTemplates(await templateService.getAll());
    } catch {
      toastError('Error', { description: 'No fue posible cargar las plantillas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter(t =>
      [t.nombre, t.codigo, t.type?.name, t.version].some(v => String(v ?? '').toLowerCase().includes(term))
    );
  }, [templates, search]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (t: DocumentTemplate) => { setEditing(t); setModalOpen(true); };

  const handleDelete = async (t: DocumentTemplate) => {
    if (!window.confirm(`¿Eliminar la plantilla "${t.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      setDeletingId(t.id);
      await templateService.remove(t.id);
      toastSuccess('Plantilla eliminada', { description: `"${t.nombre}" fue eliminada.` });
      setTemplates(prev => prev.filter(x => x.id !== t.id));
    } catch {
      toastError('Error', { description: 'No se pudo eliminar la plantilla.' });
    } finally {
      setDeletingId(null);
    }
  };

  const dataFieldCount = (t: DocumentTemplate) =>
    Array.isArray(t.columns_config) ? t.columns_config.length : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#1e2b66]/10 text-[#1e2b66]">
            <FileStack className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">Plantillas</h1>
            <p className="mt-1 text-sm text-slate-600">Estructuras reutilizables para crear documentos más rápido.</p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e2b66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172252]">
          <Plus className="h-4 w-4" /> Crear plantilla
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código o tipo"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1e2b66] focus:ring-4 focus:ring-[#1e2b66]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-[#1e2b66]" /> Cargando plantillas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-[#1e2b66]/10 text-[#1e2b66]">
              <FileStack className="h-7 w-7" />
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-950">Sin plantillas</h4>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">Crea tu primera plantilla para reutilizar estructuras al crear documentos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Nombre', 'Código', 'Tipo', 'Versión', 'Vigencia', 'Campos'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{h}</th>
                  ))}
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-950">{t.nombre}</td>
                    <td className="px-5 py-4 text-sm font-mono text-slate-700">{t.codigo}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{t.type?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{t.version ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{t.vigencia ? String(t.vigencia).slice(0, 10).split('-').reverse().join('/') : '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{dataFieldCount(t)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEdit(t)} className="rounded-lg p-2 text-slate-500 transition hover:bg-[#1e2b66]/10 hover:text-[#1e2b66]" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(t)} disabled={deletingId === t.id} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Eliminar">
                          {deletingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TemplateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { toastSuccess(editing ? 'Plantilla actualizada' : 'Plantilla creada'); fetchTemplates(); }}
        template={editing}
      />
    </div>
  );
};

export default PlantillasTable;
