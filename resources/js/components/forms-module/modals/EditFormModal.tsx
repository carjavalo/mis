import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Bell, Check, Clock, Info, Loader2, Lock, Pencil, X } from 'lucide-react';
import { CreateFormData, DocumentType, DynamicForm, FormColumn, COLUMN_TYPES, isPresentationalColumn } from '../types/types';
import ColumnBuilder from '../ColumnBuilder';
import { getColumnIcon } from '@/components/ui/ColumnIcons';
import { formsService } from '@/lib/formService';

interface EditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  form: DynamicForm | null;
}

interface EditState {
  name: string;
  slug: string;
  document_type_id: number | null;
  version: string;
  vigencia: string;
  is_notification_enabled: boolean;
  notification_time: string;
}

const EditFormModal: React.FC<EditFormModalProps> = ({ isOpen, onClose, onSuccess, form }) => {
  const [meta, setMeta] = useState<EditState>({
    name: '', slug: '', document_type_id: null, version: '', vigencia: '',
    is_notification_enabled: false, notification_time: '08:00',
  });
  const [newColumns, setNewColumns] = useState<FormColumn[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const existingColumns = useMemo(
    () => (form && Array.isArray(form.columns_config) ? form.columns_config : []),
    [form]
  );

  const existingNames = useMemo(
    () => new Set(existingColumns.map(c => c.name)),
    [existingColumns]
  );

  useEffect(() => {
    if (!isOpen) return;
    formsService.getDocumentTypes().then(setDocumentTypes).catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !form) return;
    setMeta({
      name: form.name ?? '',
      slug: form.slug ?? '',
      document_type_id: form.document_type_id ?? null,
      version: form.version ?? '',
      vigencia: form.vigencia ? String(form.vigencia).slice(0, 10) : '',
      is_notification_enabled: !!form.is_notification_enabled,
      notification_time: form.notification_time ? String(form.notification_time).slice(0, 5) : '08:00',
    });
    setNewColumns([]);
    setError('');
  }, [isOpen, form]);

  const getTypeLabel = (type: string) => COLUMN_TYPES.find(t => t.value === type)?.label || type;

  const validate = (): boolean => {
    if (!meta.name.trim()) { setError('El nombre del documento es obligatorio'); return false; }
    if (!meta.slug.trim()) { setError('El slug es obligatorio'); return false; }
    if (!/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(meta.slug)) {
      setError('El slug solo puede contener letras, números y guiones'); return false;
    }

    const reserved = new Set(['id', 'created_by', 'status', 'reviewer_id', 'reviewed_at', 'review_comments', 'created_at', 'updated_at']);
    const seen = new Set<string>(existingNames);

    for (let i = 0; i < newColumns.length; i++) {
      const col = newColumns[i];
      if (isPresentationalColumn(col.type)) {
        if (!col.label.trim()) { setError(`El bloque de presentación nuevo #${i + 1} debe tener texto`); return false; }
        continue;
      }
      const cname = col.name.trim();
      if (!cname || !col.label.trim()) { setError(`El campo nuevo #${i + 1} debe tener nombre y etiqueta`); return false; }
      if (!/^[a-z][a-z0-9_]*$/.test(cname)) { setError(`El campo nuevo #${i + 1}: nombre técnico debe estar en snake_case`); return false; }
      if (reserved.has(cname)) { setError(`El campo nuevo #${i + 1}: "${cname}" es un nombre reservado`); return false; }
      if (seen.has(cname)) { setError(`El campo nuevo #${i + 1}: el nombre técnico "${cname}" ya existe en el documento`); return false; }
      seen.add(cname);
      if (col.type === 'enum' && (!col.options || col.options.length === 0)) {
        setError(`El campo nuevo #${i + 1} de tipo "Lista de Opciones" debe tener al menos una opción`); return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form || !validate()) return;

    setIsLoading(true);
    try {
      const processedNew = newColumns.map((col, idx) => ({
        name: isPresentationalColumn(col.type) ? `h_${Date.now()}_${idx}` : col.name.trim(),
        type: col.type,
        label: col.label.trim(),
        required: isPresentationalColumn(col.type) ? false : (col.required || false),
        options: col.type === 'enum' ? col.options : undefined,
        blocks: col.type === 'header' ? col.blocks : undefined,
      }));

      const payload: Partial<CreateFormData> = {
        name: meta.name.trim(),
        slug: meta.slug.trim(),
        document_type_id: meta.document_type_id,
        version: meta.version?.trim() || null,
        vigencia: meta.vigencia || null,
        is_notification_enabled: meta.is_notification_enabled,
        notification_time: meta.is_notification_enabled ? meta.notification_time : null,
        columns: [...existingColumns, ...processedNew],
      };

      await formsService.updateForm(form.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el documento');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !form) return null;

  const fieldClassName = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#1e2b66] focus:ring-4 focus:ring-[#1e2b66]/10 disabled:bg-slate-100';
  const labelClassName = 'mb-2 block text-sm font-semibold text-slate-700';

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={() => !isLoading && onClose()}>
      <div
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-lg sm:border sm:border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-slate-200">
          <div className="h-1 bg-[#1e2b66]" />
          <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#1e2b66]/10 text-[#1e2b66]">
                <Pencil className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1e2b66]">Editar documento</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">{form.name}</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">Edita la información y agrega campos nuevos. Los campos existentes no se pueden modificar ni eliminar para no perder datos.</p>
              </div>
            </div>
            <button type="button" onClick={() => !isLoading && onClose()} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" disabled={isLoading}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
            <div className="mx-auto grid max-w-4xl gap-5">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Información base */}
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClassName}>Nombre del documento <span className="text-red-600">*</span></label>
                    <input type="text" value={meta.name} onChange={(e) => setMeta(p => ({ ...p, name: e.target.value }))} className={fieldClassName} disabled={isLoading} />
                  </div>
                  <div>
                    <label className={labelClassName}>Slug <span className="text-red-600">*</span></label>
                    <input type="text" value={meta.slug} onChange={(e) => setMeta(p => ({ ...p, slug: e.target.value }))} className={`${fieldClassName} font-mono`} disabled={isLoading} />
                  </div>
                  <div>
                    <label className={labelClassName}>Tipo de documento</label>
                    <select value={meta.document_type_id ?? ''} onChange={(e) => setMeta(p => ({ ...p, document_type_id: e.target.value ? Number(e.target.value) : null }))} className={fieldClassName} disabled={isLoading}>
                      <option value="">Seleccione un tipo...</option>
                      {documentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>Versión</label>
                    <input type="number" step="0.1" min="0" value={meta.version} onChange={(e) => setMeta(p => ({ ...p, version: e.target.value }))} className={fieldClassName} disabled={isLoading} />
                  </div>
                  <div>
                    <label className={labelClassName}>Vigencia</label>
                    <input type="date" value={meta.vigencia} onChange={(e) => setMeta(p => ({ ...p, vigencia: e.target.value }))} className={fieldClassName} disabled={isLoading} />
                  </div>

                  <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-700"><Bell className="h-5 w-5" /></span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Recordatorios por correo</p>
                          <p className="mt-1 text-sm text-slate-600">Notifica a los usuarios asignados a una hora definida.</p>
                        </div>
                      </div>
                      <button type="button" role="switch" aria-checked={meta.is_notification_enabled} onClick={() => setMeta(p => ({ ...p, is_notification_enabled: !p.is_notification_enabled }))} className={`relative h-7 w-12 shrink-0 rounded-full transition ${meta.is_notification_enabled ? 'bg-[#1e2b66]' : 'bg-slate-300'}`} disabled={isLoading}>
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${meta.is_notification_enabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    {meta.is_notification_enabled && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Clock className="h-4 w-4 text-[#1e2b66]" /> Hora de envío</label>
                        <input type="time" value={meta.notification_time} onChange={(e) => setMeta(p => ({ ...p, notification_time: e.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm sm:w-40" disabled={isLoading} />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Campos actuales (solo lectura) */}
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <h3 className="text-base font-semibold text-slate-950">Campos actuales</h3>
                  <span className="text-xs text-slate-500">(no editables)</span>
                </div>
                <div className="space-y-2">
                  {existingColumns.map((col, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e2b66]/10 text-[#1e2b66]">
                        {getColumnIcon(col.type, 'h-4 w-4')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{col.label || 'Sin nombre'}</p>
                        <p className="truncate text-xs text-slate-500">{getTypeLabel(col.type)}{!isPresentationalColumn(col.type) && col.name ? ` · ${col.name}` : ''}</p>
                      </div>
                      {col.required && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Requerido</span>}
                    </div>
                  ))}
                </div>
              </section>

              {/* Agregar campos nuevos */}
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#1e2b66]/15 bg-[#1e2b66]/5 px-3 py-2 text-sm text-[#1e2b66]">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Agrega campos nuevos. Se añadirán como opcionales para no afectar los registros existentes.</span>
                </div>
                <ColumnBuilder columns={newColumns} onChange={setNewColumns} />
              </section>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => !isLoading && onClose()} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={isLoading}>Cancelar</button>
              <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e2b66] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#172252] disabled:bg-slate-300">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="h-4 w-4" /> Guardar cambios</>}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default EditFormModal;
